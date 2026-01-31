import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageCheck } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getRevenueSummary, getSoldProducts } from '../api/revenue';
import { updateOrderStatus } from '../api/order';
import { API_BASE_URL } from '../api/config';
import '../styles/RevenuePage.css';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/48x48/f0f0f0/666?text=SP';

function buildProductImageSrc(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return null;
  const raw = imageUrl.trim();
  if (raw.startsWith('http')) return raw;
  const base = API_BASE_URL.replace(/\/$/, '');
  if (raw.startsWith('/')) return base.replace(/\/api\/?$/, '') + raw;
  return `${base}/products/images/${raw}`;
}

function groupSoldProductsByOrder(soldProducts) {
  const byOrder = new Map();
  for (const p of soldProducts) {
    const orderId = p.orderId;
    if (!byOrder.has(orderId)) {
      byOrder.set(orderId, {
        orderId,
        orderStatus: p.orderStatus || 'PENDING',
        soldDate: p.soldDate,
        items: [],
        orderTotal: 0,
      });
    }
    const order = byOrder.get(orderId);
    const amount = Number(p.totalAmount) || 0;
    order.items.push({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      quantity: p.quantity ?? 0,
      totalAmount: amount,
    });
    order.orderTotal += amount;
  }
  return Array.from(byOrder.values()).sort((a, b) => {
    const dateA = a.soldDate ? new Date(a.soldDate).getTime() : 0;
    const dateB = b.soldDate ? new Date(b.soldDate).getTime() : 0;
    return dateB - dateA;
  });
}

const RevenuePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [soldProducts, setSoldProducts] = useState([]);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  // Tạm thời không dùng lọc — list tất cả đơn hàng đã bán

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(saved));
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const userId = user?.id ?? user?.userId ?? null;

  useEffect(() => {
    let cancelled = false;
    if (userId == null) {
      setLoading(false);
      setRevenueSummary({ totalRevenue: 0, totalProductsSold: 0, period: '' });
      setSoldProducts([]);
      return;
    }
    setLoading(true);
    Promise.all([
      getRevenueSummary(userId, null, null, null),
      getSoldProducts(userId, null, null, null)
    ])
      .then(([summaryData, productsData]) => {
        if (!cancelled) {
          setRevenueSummary(summaryData);
          setSoldProducts(Array.isArray(productsData) ? productsData : []);
        }
      })
      .catch((error) => {
        console.error('Error loading revenue data:', error);
        if (!cancelled) {
          setRevenueSummary({ totalRevenue: 0, totalProductsSold: 0, period: '' });
          setSoldProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const ordersBySeller = useMemo(() => groupSoldProductsByOrder(soldProducts), [soldProducts]);

  const handleConfirmOrder = async (orderId) => {
    if (!orderId) return;
    const ok = window.confirm('Xác nhận đơn hàng này sẽ chuyển trạng thái sang "Đang vận chuyển". Bạn có chắc muốn xác nhận?');
    if (!ok) return;
    try {
      setConfirmingOrderId(orderId);
      await updateOrderStatus(orderId, 'SHIPPING');
      setSoldProducts((prev) =>
        prev.map((p) =>
          p.orderId === orderId ? { ...p, orderStatus: 'SHIPPING' } : p
        )
      );
    } catch (err) {
      alert(err?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const formatPrice = (price) => {
    const n = Number(price);
    return new Intl.NumberFormat('vi-VN').format(Number.isNaN(n) ? 0 : n) + ' ₫';
  };

  const formatDate = (dateString) => {
    if (dateString == null || dateString === '') return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') return 'Chờ xử lý';
    if (s === 'CONFIRMED') return 'Đã xác nhận';
    if (s === 'SHIPPING') return 'Đang vận chuyển';
    if (s === 'COMPLETED') return 'Đã giao';
    if (s === 'CANCELLED') return 'Đã hủy';
    return status || '—';
  };

  const summary = revenueSummary ?? { totalRevenue: 0, totalProductsSold: 0, period: '' };

  const content = loading ? (
    <div className="revenue-loading">Đang tải...</div>
  ) : (
    <>
      <main className="main-content">
        <div className="revenue-container">
          <div className="left-panel">
            <div className="summary-section">
              <h3 className="summary-title">Tổng quan doanh thu</h3>
              <div className="summary-card">
                <div className="summary-item">
                  <div className="summary-label">Tổng doanh thu:</div>
                  <div className="summary-value revenue-value">{formatPrice(summary.totalRevenue ?? 0)}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Số đơn hàng:</div>
                  <div className="summary-value products-value">{ordersBySeller.length} đơn</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Số lượng đã bán:</div>
                  <div className="summary-value products-value">{summary.totalProductsSold ?? 0} sản phẩm</div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="products-section">
              <div className="products-header">
                <h2 className="section-title">Đơn hàng của tôi</h2>
                <p className="section-subtitle">
                  Các đơn hàng có sản phẩm của bạn, theo từng đơn với danh sách sản phẩm và tổng thu nhập.
                </p>
              </div>

              <div className="revenue-orders-list">
                {ordersBySeller.length > 0 ? (
                  ordersBySeller.map((order) => {
                    const isPending = (order.orderStatus || '').toUpperCase() === 'PENDING';
                    return (
                      <div key={order.orderId} className="revenue-order-card">
                        <div className="revenue-order-header">
                          <span className="revenue-order-id">Đơn #{order.orderId}</span>
                          <span className="revenue-order-date">{formatDate(order.soldDate)}</span>
                          <span className={`revenue-order-status-badge status-${(order.orderStatus || '').toLowerCase()}`}>
                            {getStatusLabel(order.orderStatus)}
                          </span>
                        </div>
                        <div className="revenue-order-products">
                          <div className="revenue-order-table-header">
                            <div className="revenue-order-th img-col">Hình ảnh</div>
                            <div className="revenue-order-th name-col">Tên sản phẩm</div>
                            <div className="revenue-order-th qty-col">Số lượng</div>
                            <div className="revenue-order-th amount-col">Thành tiền</div>
                          </div>
                          {order.items.map((item, idx) => {
                            const imgSrc = buildProductImageSrc(item.imageUrl) || PLACEHOLDER_IMG;
                            return (
                              <div key={`${order.orderId}-${item.id}-${idx}`} className="revenue-order-row">
                                <div className="revenue-order-td img-col">
                                  <img src={imgSrc} alt={item.name} className="revenue-product-thumb" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
                                </div>
                                <div className="revenue-order-td name-col">{item.name}</div>
                                <div className="revenue-order-td qty-col">{item.quantity}</div>
                                <div className="revenue-order-td amount-col">{formatPrice(item.totalAmount)}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="revenue-order-footer">
                          <div className="revenue-order-total">
                            <span className="revenue-order-total-label">Tổng thu nhập đơn:</span>
                            <span className="revenue-order-total-value">{formatPrice(order.orderTotal)}</span>
                          </div>
                          <div className="revenue-order-action">
                            {isPending && (
                              <button
                                type="button"
                                className="revenue-confirm-order-btn"
                                onClick={() => handleConfirmOrder(order.orderId)}
                                disabled={confirmingOrderId === order.orderId}
                              >
                                <PackageCheck size={16} />
                                <span>Xác nhận đơn hàng</span>
                              </button>
                            )}
                            {!isPending && (
                              <span className="revenue-order-status-text">{getStatusLabel(order.orderStatus)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <div className="empty-title">Chưa có đơn hàng nào</div>
                    <div className="empty-subtitle">
                      Khi có đơn hàng chứa sản phẩm của bạn, chúng sẽ hiển thị ở đây theo từng đơn.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <a href="/revenue" className="nav-item active">
          <span className="nav-icon">💰</span>
          <span className="nav-text">Doanh thu</span>
        </a>
        <a href="/products" className="nav-item">
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Đang bán</span>
        </a>
        <a href="/add" className="nav-item">
          <span className="nav-icon">➕</span>
          <span className="nav-text">Thêm mới</span>
        </a>
      </nav>
    </>
  );

  return (
    <Layout>
      <div className="revenue-page">
        {content}
      </div>
    </Layout>
  );
};

export default RevenuePage;
