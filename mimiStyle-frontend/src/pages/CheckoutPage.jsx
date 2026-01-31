import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { getApplicableVouchers } from '../api/voucher';
import { getProvincesWithDistricts, getWards } from '../api/location';
import '../styles/CheckoutPage.css';

// Phí vận chuyển để trống, chưa tính
const SHIPPING_FEE = 0;

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity } = useCart();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
  });
  const [provincesWithDistricts, setProvincesWithDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const districts = useMemo(() => {
    if (!form.provinceCode) return [];
    const province = provincesWithDistricts.find(
      (p) => p.code === Number(form.provinceCode) || p.code === form.provinceCode
    );
    return province?.districts ?? [];
  }, [provincesWithDistricts, form.provinceCode]);

  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const discount = selectedVoucher ? Number(selectedVoucher.discountValue) : 0;
  const total = Math.max(0, subtotal - discount + SHIPPING_FEE);

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const u = JSON.parse(saved);
      setUser(u);
      setForm((prev) => ({
        ...prev,
        fullName: u?.fullName ?? '',
        phone: u?.phoneNumber ?? '',
        email: u?.email ?? '',
        address: u?.address ?? '',
      }));
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoadingLocation(true);
    getProvincesWithDistricts()
      .then((list) => {
        if (!cancelled) setProvincesWithDistricts(list);
      })
      .catch(() => {
        if (!cancelled) setProvincesWithDistricts([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLocation(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!form.districtCode) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setLoadingWards(true);
    setWards([]);
    setForm((prev) => ({ ...prev, wardCode: '' }));
    getWards(Number(form.districtCode))
      .then((list) => {
        if (!cancelled) setWards(list);
      })
      .catch(() => {
        if (!cancelled) setWards([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingWards(false);
      });
    return () => { cancelled = true; };
  }, [form.districtCode]);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    setLoadingVouchers(true);
    getApplicableVouchers(subtotal)
      .then((data) => {
        if (!cancelled) setVouchers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setVouchers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingVouchers(false);
      });
    return () => { cancelled = true; };
  }, [subtotal, items.length]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'provinceCode' ? { districtCode: '', wardCode: '' } : {}),
    }));
  };

  const handleContinueToPayment = () => {
    const province = provincesWithDistricts.find(
      (p) => p.code === Number(form.provinceCode) || p.code === form.provinceCode
    );
    const district = districts.find(
      (d) => d.code === Number(form.districtCode) || d.code === form.districtCode
    );
    const ward = wards.find(
      (w) => w.code === Number(form.wardCode) || w.code === form.wardCode
    );
    navigate('/checkout/payment', {
      state: {
        form: {
          ...form,
          provinceName: province?.name ?? '',
          districtName: district?.name ?? '',
          wardName: ward?.name ?? '',
        },
        selectedVoucher,
      },
    });
  };

  if (items.length === 0 && user) {
    return (
      <Layout>
        <div className="checkout-page">
          <div className="checkout-empty">
            <p>Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.</p>
            <button type="button" className="checkout-btn-back" onClick={() => navigate('/home')}>
              Về trang chủ
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-page">
        <div className="checkout-container">
          {/* Left: Thông tin giao hàng */}
          <section className="checkout-delivery">
            <h1 className="checkout-section-title">Thông tin giao hàng</h1>
            <div className="checkout-form">
              <label className="checkout-label">Họ và tên</label>
              <input
                type="text"
                className="checkout-input"
                value={form.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Họ và tên"
              />
              <label className="checkout-label">Số điện thoại</label>
              <input
                type="tel"
                className="checkout-input"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Số điện thoại"
              />
              <label className="checkout-label">Email</label>
              <input
                type="email"
                className="checkout-input"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email"
              />
              <label className="checkout-label">Địa chỉ</label>
              <input
                type="text"
                className="checkout-input"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Địa chỉ"
              />
              <label className="checkout-label">Tỉnh / thành</label>
              <select
                className="checkout-select"
                value={form.provinceCode}
                onChange={(e) => handleInputChange('provinceCode', e.target.value)}
                disabled={loadingLocation}
              >
                <option value="">Chọn tỉnh / thành</option>
                {provincesWithDistricts.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              <label className="checkout-label">Quận / huyện</label>
              <select
                className="checkout-select"
                value={form.districtCode}
                onChange={(e) => handleInputChange('districtCode', e.target.value)}
                disabled={!form.provinceCode}
              >
                <option value="">Chọn quận / huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
              <label className="checkout-label">Phường / xã</label>
              <select
                className="checkout-select"
                value={form.wardCode}
                onChange={(e) => handleInputChange('wardCode', e.target.value)}
                disabled={!form.districtCode || loadingWards}
              >
                <option value="">Chọn phường / xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Right: Giỏ hàng + Mã giảm giá + Tổng */}
          <section className="checkout-summary">
            <h2 className="checkout-cart-label">Giỏ hàng</h2>
            <div className="checkout-product-list">
              {items.map((item) => {
                const imgSrc = item.product?.imageSrc || 'https://via.placeholder.com/80x80/f0f0f0/666?text=SP';
                const variantText = [item.colorLabel, item.sizeLabel].filter(Boolean).join(' / ') || '';
                const lineTotal = (item.product?.price ?? 0) * item.quantity;
                return (
                  <div key={`${item.productId}-${item.colorIndex}-${item.sizeIndex}`} className="checkout-product-item">
                    <img className="checkout-product-img" src={imgSrc} alt={item.product?.name} />
                    <div className="checkout-product-info">
                      <div className="checkout-product-name">{item.product?.name}</div>
                      {variantText && <div className="checkout-product-variant">{variantText}</div>}
                      <div className="checkout-product-row">
                        <div className="checkout-product-qty">
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            onClick={() => updateQuantity(item.productId, item.colorIndex, item.sizeIndex, -1)}
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="checkout-qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            onClick={() => updateQuantity(item.productId, item.colorIndex, item.sizeIndex, 1)}
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="checkout-product-price">{formatPrice(lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="checkout-voucher-section">
              <label className="checkout-label">Mã giảm giá</label>
              {loadingVouchers ? (
                <p className="checkout-voucher-loading">Đang tải mã giảm giá...</p>
              ) : vouchers.length === 0 ? (
                <p className="checkout-voucher-empty">Không có mã giảm giá phù hợp với đơn hàng hiện tại.</p>
              ) : (
                <div className="checkout-voucher-list">
                  {vouchers.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`checkout-voucher-item ${selectedVoucher?.id === v.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVoucher(selectedVoucher?.id === v.id ? null : v)}
                    >
                      <span className="checkout-voucher-code">{v.code}</span>
                      <span className="checkout-voucher-desc">
                        Giảm {formatPrice(v.discountValue)}
                        {v.minOrderValue ? ` cho đơn từ ${formatPrice(v.minOrderValue)}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Phí vận chuyển</span>
                <span></span>
              </div>
              {discount > 0 && (
                <div className="checkout-summary-row checkout-discount">
                  <span>Giảm giá ({selectedVoucher?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="checkout-summary-row checkout-total">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button type="button" className="checkout-continue-btn" onClick={handleContinueToPayment}>
              Tiếp tục đến phương thức thanh toán
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
