import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, PackageCheck } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getRevenueSummary, getSoldProducts } from '../api/revenue';
import { updateOrderStatus } from '../api/order';
import { API_ORIGIN } from '../api/config';
import '../styles/RevenuePage.css';

const RevenuePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [soldProducts, setSoldProducts] = useState([]);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '2024-07-15',
    endDate: '2025-10-17',
    category: 'all'
  });

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
    const startDate = filters.startDate;
    const endDate = filters.endDate;
    const category = filters.category === 'all' ? null : filters.category;

    if (userId == null) {
      setLoading(false);
      setRevenueSummary({ totalRevenue: 0, totalProductsSold: 0, period: '' });
      setSoldProducts([]);
      return;
    }

    setLoading(true);
    Promise.all([
      getRevenueSummary(userId, startDate, endDate, category),
      getSoldProducts(userId, startDate, endDate, category)
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
  }, [userId, filters.startDate, filters.endDate, filters.category]);

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatPrice = (price) => {
    const n = Number(price);
    return new Intl.NumberFormat('vi-VN').format(Number.isNaN(n) ? 0 : n) + ' VNĐ';
  };

  const formatDate = (dateString) => {
    if (dateString == null || dateString === '') return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN');
  };

  const summary = revenueSummary ?? { totalRevenue: 0, totalProductsSold: 0, period: '' };

  const content = loading ? (
    <div className="loading">Đang tải...</div>
  ) : (
    <>
      <main className="main-content">
        <div className="revenue-container">
          {/* Left Panel - Filters & Summary */}
          <div className="left-panel">
            <div className="filter-section">
              <h2 className="section-title">Bộ lọc & Tóm tắt</h2>
              
              {/* Date Range Filter */}
              <div className="filter-group">
                <label className="filter-label">Chọn khoảng ngày</label>
                <div className="date-range">
                  <div className="date-input-group">
                    <Calendar className="date-icon" size={16} />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <span className="date-separator">-</span>
                  <div className="date-input-group">
                    <Calendar className="date-icon" size={16} />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              <button className="apply-filter-btn">
                Áp dụng bộ lọc
              </button>

              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-label">Lọc theo danh mục</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="category-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="binh-sua">Bình sữa</option>
                  <option value="ta-bim">Tã bỉm</option>
                  <option value="do-choi">Đồ chơi</option>
                  <option value="sua-bot">Sữa bột</option>
                  <option value="xe-day">Xe đẩy</option>
                </select>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="summary-section">
              <h3 className="summary-title">Tổng quan doanh thu</h3>
              <div className="summary-card">
                <div className="summary-item">
                  <div className="summary-label">Tổng doanh thu:</div>
                  <div className="summary-value revenue-value">
                    {formatPrice(summary.totalRevenue ?? 0)}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Số lượng đã bán:</div>
                  <div className="summary-value products-value">
                    {summary.totalProductsSold ?? 0} sản phẩm
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Sold Products */}
          <div className="right-panel">
            <div className="products-section">
              <div className="products-header">
                <h2 className="section-title">Sản phẩm đã bán</h2>
                <p className="section-subtitle">
                  Tổng quan chi tiết về các sản phẩm đã bán gần đây của bạn.
                </p>
              </div>

              <div className="products-table">
                <div className="table-header">
                  <div className="header-cell product-col">Hình ảnh</div>
                  <div className="header-cell name-col">Tên sản phẩm</div>
                  <div className="header-cell quantity-col">Số lượng</div>
                  <div className="header-cell amount-col">Tổng thu nhập</div>
                  <div className="header-cell date-col">Ngày bán</div>
                  <div className="header-cell action-col">Thao tác</div>
                </div>

                <div className="table-body">
                  {soldProducts.length > 0 ? (
                    soldProducts.map((product, idx) => {
                      const imgSrc = product.imageUrl && !product.imageUrl.startsWith('http')
                        ? `${API_ORIGIN}${product.imageUrl}`
                        : (product.imageUrl || 'https://via.placeholder.com/60x60?text=SP');
                      const isPending = (product.orderStatus || '').toUpperCase() === 'PENDING';
                      return (
                        <div key={`${product.orderId}-${product.id}-${idx}`} className="table-row">
                          <div className="table-cell product-col">
                            <img src={imgSrc} alt={product.name} className="product-image" />
                          </div>
                          <div className="table-cell name-col">
                            <span className="product-name">{product.name}</span>
                          </div>
                          <div className="table-cell quantity-col">
                            <span className="quantity">{product.quantity}</span>
                          </div>
                          <div className="table-cell amount-col">
                            <span className="amount">{formatPrice(product.totalAmount)}</span>
                          </div>
                          <div className="table-cell date-col">
                            <span className="date">{formatDate(product.soldDate)}</span>
                          </div>
                          <div className="table-cell action-col">
                            {isPending && (
                              <button
                                type="button"
                                className="revenue-confirm-order-btn"
                                onClick={() => handleConfirmOrder(product.orderId)}
                                disabled={confirmingOrderId === product.orderId}
                              >
                                <PackageCheck size={16} />
                                <span>Xác nhận đơn hàng</span>
                              </button>
                            )}
                            {!isPending && (
                              <span className="revenue-order-status">
                                {product.orderStatus === 'SHIPPING' ? 'Đang vận chuyển' : product.orderStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <div className="empty-title">Chưa có sản phẩm nào được bán</div>
                      <div className="empty-subtitle">
                        Khi bạn bán sản phẩm thành công, chúng sẽ hiển thị ở đây
                      </div>
                    </div>
                  )}
                </div>
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