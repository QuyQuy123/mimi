import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, Banknote, CreditCard, Wallet } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { addOrder } from '../utils/orderHistory';
import { createOrder as createOrderApi } from '../api/order';
import '../styles/CheckoutPaymentPage.css';

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Giao hàng tiêu chuẩn', fee: 20000, icon: Truck },
];

const PAYMENT_OPTIONS = [
  { id: 'cod', name: 'Thanh toán khi giao hàng (COD)', icon: Banknote },
  { id: 'vnpay', name: 'Thẻ ATM/Visa/Master/JCB/QR Pay qua cổng VNPAY', icon: CreditCard },
  { id: 'other', name: 'Phương thức thanh toán khác', icon: Wallet },
];

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);
}

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart } = useCart();
  const [shippingId, setShippingId] = useState('standard');
  const [paymentId, setPaymentId] = useState('cod');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const state = location.state || {};
  const { form, selectedVoucher } = state;

  useEffect(() => {
    if (selectedVoucher) {
      setAppliedVoucher(selectedVoucher);
    }
  }, [selectedVoucher]);

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    if (items.length === 0) {
      navigate('/checkout', { replace: true });
    }
  }, [navigate, items.length]);

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId) || SHIPPING_OPTIONS[0];
  const shippingFee = shipping?.fee ?? 0;
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const discount = appliedVoucher ? Number(appliedVoucher.discountValue) : 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyDiscount = () => {
    // TODO: gọi API kiểm tra mã giảm giá, tạm thời giữ voucher từ bước trước
    if (selectedVoucher && discountCode.toUpperCase() === selectedVoucher.code) {
      setAppliedVoucher(selectedVoucher);
    }
    setDiscountCode('');
  };

  const handleCompleteOrder = async () => {
    const saved = sessionStorage.getItem('user');
    const userId = saved ? (() => { try { const u = JSON.parse(saved); return u?.id ?? u?.userId ?? null; } catch { return null; } })() : null;
    const formData = form ?? {};
    const paymentMethodMap = { cod: 'COD', vnpay: 'VNPAY', other: 'BANK_TRANSFER' };

    if (userId) {
      const orderPayload = {
        id: `order_${Date.now()}`,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          productId: i.productId,
          product: i.product,
          colorIndex: i.colorIndex,
          sizeIndex: i.sizeIndex,
          colorLabel: i.colorLabel,
          sizeLabel: i.sizeLabel,
          quantity: i.quantity,
        })),
        form: formData,
        shippingFee,
        paymentId,
        subtotal,
        discount,
        total,
        status: 'pending',
      };
      addOrder(userId, orderPayload);

      try {
        await createOrderApi({
          buyerId: userId,
          shippingName: formData.fullName ?? '',
          shippingPhone: formData.phone ?? '',
          shippingAddress: [formData.address, formData.wardName, formData.districtName, formData.provinceName].filter(Boolean).join(', '),
          shippingEmail: formData.email,
          shippingFee: Number(shippingFee) || 0,
          discountAmount: Number(discount) || 0,
          paymentMethod: paymentMethodMap[paymentId] || 'COD',
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        });
      } catch (err) {
        console.warn('API tạo đơn hàng thất bại (đơn đã lưu local):', err?.message);
      }
    }
    clearCart();
    navigate('/order-history', { replace: true });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="checkout-payment-page">
        <div className="checkout-payment-container">
          {/* Left: Phương thức vận chuyển + Thanh toán */}
          <section className="checkout-payment-methods">
            <div className="payment-block">
              <h2 className="payment-block-title">Phương thức vận chuyển</h2>
              <div className="payment-options">
                {SHIPPING_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <label key={opt.id} className={`payment-option ${shippingId === opt.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={shippingId === opt.id}
                        onChange={() => setShippingId(opt.id)}
                      />
                      <span className="payment-option-icon">
                        <Icon size={20} />
                      </span>
                      <span className="payment-option-label">{opt.name}</span>
                      <span className="payment-option-fee">{formatPrice(opt.fee)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="payment-block">
              <h2 className="payment-block-title">Phương thức thanh toán</h2>
              <div className="payment-options">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <label key={opt.id} className={`payment-option ${paymentId === opt.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={paymentId === opt.id}
                        onChange={() => setPaymentId(opt.id)}
                      />
                      <span className="payment-option-icon">
                        <Icon size={20} />
                      </span>
                      <span className="payment-option-label">{opt.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right: Tóm tắt đơn hàng */}
          <section className="checkout-payment-summary">
            <h2 className="payment-summary-title">Tóm tắt đơn hàng</h2>
            <div className="payment-summary-products">
              {items.map((item) => {
                const imgSrc = item.product?.imageSrc || 'https://via.placeholder.com/80x80/f0f0f0/666?text=SP';
                const variantText = [item.colorLabel, item.sizeLabel].filter(Boolean).join(' / ') || '';
                const lineTotal = (item.product?.price ?? 0) * item.quantity;
                return (
                  <div key={`${item.productId}-${item.colorIndex}-${item.sizeIndex}`} className="payment-summary-item">
                    <img className="payment-summary-img" src={imgSrc} alt={item.product?.name} />
                    <div className="payment-summary-info">
                      <div className="payment-summary-name">{item.product?.name}</div>
                      {variantText && <div className="payment-summary-variant">{variantText}</div>}
                      <div className="payment-summary-qty">Số lượng: {item.quantity}</div>
                      <div className="payment-summary-price">{formatPrice(lineTotal)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="payment-summary-voucher">
              <label className="payment-label">Mã giảm giá</label>
              <div className="payment-voucher-row">
                <input
                  type="text"
                  className="payment-voucher-input"
                  placeholder="Nhập mã giảm giá"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button type="button" className="payment-voucher-btn" onClick={handleApplyDiscount}>
                  Áp dụng
                </button>
              </div>
              {appliedVoucher && (
                <p className="payment-voucher-applied">Đã áp dụng: {appliedVoucher.code}</p>
              )}
            </div>

            <div className="payment-summary-rows">
              <div className="payment-summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="payment-summary-row">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              {discount > 0 && (
                <div className="payment-summary-row payment-discount">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="payment-summary-row payment-total">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button type="button" className="payment-complete-btn" onClick={handleCompleteOrder}>
              Hoàn tất đơn hàng
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
