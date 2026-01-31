import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getOrderHistory, updateOrderStatus } from '../utils/orderHistory';
import { getMyOrders, updateOrderStatus as updateOrderStatusApi } from '../api/order';
import { API_BASE_URL } from '../api/config';
import '../styles/OrderHistoryPage.css';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/60x60/f0f0f0/666?text=SP';

// Cùng format với HomePage / ProductDetailPage: base + /api/products/images/ + filename
function buildProductImageSrc(imageUrl) {
  const raw = imageUrl != null && typeof imageUrl === 'string' ? imageUrl.trim() : '';
  if (!raw || raw.includes('src/assets')) return null;
  if (raw.startsWith('http')) return raw;
  const base = API_BASE_URL.replace(/\/$/, '');
  if (raw.startsWith('/')) return base.replace(/\/api\/?$/, '') + raw;
  return `${base}/products/images/${raw}`;
}

function mapApiOrderToDisplay(apiOrder) {
  const items = (apiOrder.items || []).map((i) => {
    const imageUrl = i.imageUrl ?? i.image_url;
    return {
    product: {
      name: i.productName,
      imageSrc: buildProductImageSrc(imageUrl),
      price: i.price != null ? Number(i.price) : null,
    },
    quantity: i.quantity,
    productId: i.productId,
    lineTotal: i.lineTotal != null ? Number(i.lineTotal) : null,
  };
  });
  const status = (apiOrder.status || '').toLowerCase();
  return {
    id: String(apiOrder.id),
    createdAt: apiOrder.createdAt,
    status,
    form: {
      fullName: apiOrder.shippingName,
      phone: apiOrder.shippingPhone,
      email: apiOrder.shippingEmail,
      address: apiOrder.shippingAddress,
    },
    items,
    total: apiOrder.totalAmount,
    subtotal: apiOrder.subtotal,
    shippingFee: apiOrder.shippingFee,
    discount: apiOrder.discountAmount,
  };
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);
}

function formatDate(isoString) {
  if (isoString == null || isoString === '') return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang vận chuyển',
  completed: 'Đã giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const u = JSON.parse(saved);
      setUser(u);
      const uid = u?.id ?? u?.userId ?? null;
      if (!uid) return;
      getMyOrders(uid)
        .then((apiOrders) => {
          const list = Array.isArray(apiOrders) ? apiOrders.map(mapApiOrderToDisplay) : [];
          setOrders(list.length > 0 ? list : getOrderHistory(uid));
        })
        .catch(() => {
          setOrders(getOrderHistory(uid));
        });
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const toggleExpand = (orderId) => {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
  };

  const userId = user?.id ?? user?.userId ?? null;

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (!userId) return;
    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này?');
    if (!confirmed) return;
    const idStr = String(orderId);
    if (/^\d+$/.test(idStr)) {
      try {
        await updateOrderStatusApi(Number(orderId), 'CANCELLED');
        const apiOrders = await getMyOrders(userId);
        setOrders(Array.isArray(apiOrders) ? apiOrders.map(mapApiOrderToDisplay) : []);
        setExpandedId(null);
      } catch (err) {
        alert(err?.message || 'Không thể hủy đơn hàng');
      }
    } else {
      updateOrderStatus(userId, orderId, 'cancelled');
      setOrders(getOrderHistory(userId));
      setExpandedId(null);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="order-history-page">
        <h1 className="order-history-title">
          <History size={28} />
          Lịch sử mua hàng
        </h1>

        {orders.length === 0 ? (
          <div className="order-history-empty">
            <p>Bạn chưa có đơn hàng nào.</p>
            <button type="button" className="order-history-btn" onClick={() => navigate('/home')}>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <ul className="order-history-list">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const items = order.items ?? [];
              const form = order.form ?? {};
              return (
                <li key={order.id} className="order-history-card">
                  <button
                    type="button"
                    className="order-history-card-header"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="order-history-card-main">
                      <span className="order-history-id">#{order.id.replace('order_', '')}</span>
                      <span className="order-history-date">{formatDate(order.createdAt)}</span>
                      <span className="order-history-total">{formatPrice(order.total)}</span>
                      <span className={`order-history-status status-${(order.status ?? 'pending').toLowerCase()}`}>
                        {STATUS_LABEL[(order.status || '').toLowerCase()] ?? order.status ?? 'Chờ xử lý'}
                      </span>
                      {((order.status || '').toLowerCase() === 'pending') && (
                        <button
                          type="button"
                          className="order-history-cancel-btn"
                          onClick={(e) => handleCancelOrder(e, order.id)}
                          title="Hủy đơn hàng"
                        >
                          <XCircle size={18} />
                          <span>Hủy đơn hàng</span>
                        </button>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="order-history-chevron" size={20} />
                    ) : (
                      <ChevronDown className="order-history-chevron" size={20} />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="order-history-card-body">
                      <div className="order-history-section">
                        <h3>Sản phẩm</h3>
                        {items.map((item, idx) => {
                          const imgSrc = item.product?.imageSrc || PLACEHOLDER_IMG;
                          const variantText = [item.colorLabel, item.sizeLabel].filter(Boolean).join(' / ') || '';
                          const unitPrice = item.product?.price ?? 0;
                          const qty = item.quantity ?? 0;
                          const lineTotal = item.lineTotal ?? unitPrice * qty;
                          return (
                            <div key={idx} className="order-history-item">
                              <img
                                src={imgSrc}
                                alt={item.product?.name ?? ''}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = PLACEHOLDER_IMG;
                                }}
                              />
                              <div>
                                <div className="order-history-item-name">{item.product?.name}</div>
                                {variantText && <div className="order-history-item-variant">{variantText}</div>}
                                <div className="order-history-item-meta">
                                  Số lượng: {qty}
                                  {unitPrice > 0 && <> · Đơn giá: {formatPrice(unitPrice)}</>}
                                  {' · Thành tiền: '}{formatPrice(lineTotal)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="order-history-section">
                        <h3>Địa chỉ giao hàng</h3>
                        <p className="order-history-address">
                          {form.fullName && <strong>{form.fullName}</strong>}
                          {form.phone && <> · {form.phone}</>}
                          {form.email && <> · {form.email}</>}
                          <br />
                          {[form.address, [form.wardName, form.districtName, form.provinceName].filter(Boolean).join(', ')].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div className="order-history-section order-history-summary">
                        <div className="order-history-row">
                          <span>Tạm tính</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.shippingFee != null && order.shippingFee > 0 && (
                          <div className="order-history-row">
                            <span>Phí vận chuyển</span>
                            <span>{formatPrice(order.shippingFee)}</span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="order-history-row">
                            <span>Giảm giá</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="order-history-row order-history-total-row">
                          <span>Tổng cộng</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
