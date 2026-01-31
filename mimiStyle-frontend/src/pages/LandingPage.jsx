import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getAllProducts } from '../api/product';
import sterilizerImg from '../assets/img-product/may-tiet-trung-binh-sua-co-say-kho-bang-tia-uv-spectra-1.jpg';
import pumpImg from '../assets/img-product/May-hut-sua-dien-doi-Resonance-3-Fb1160VN-3.jpeg';
import cribImg from '../assets/img-product/top-5-thuong-hieu-noi-cho-be-duoc-ua-chuong-nhat-hien-nay-2020-1595675197.png';
import strollerImg from '../assets/img-product/xe-day-tre-em-joie-versatrax-lagoon.jpg';
import chairImg from '../assets/img-product/ghe-an-dam-umoo-1606186868.jpg';
import toyImg from '../assets/img-product/z6021933351086_28eb8d7e91cc13e47c6e338d1bea00f3.jpg';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'sale' | 'rent'
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const imageMap = {
    'Máy tiệt trùng bình sữa UV': sterilizerImg,
    'Máy hút sữa điện tử thông minh': pumpImg,
    'Nôi em bé thông minh': cribImg,
    'Xe đẩy em bé cao cấp': strollerImg,
    'Ghế ăn dặm cho bé': chairImg,
    'Bộ đồ chơi giáo dục': toyImg,
  };

  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/register');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getAllProducts();

        const processedProducts = allProducts.map((product) => {
          const isNewProduct = product.createdAt
            ? (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) <= 7
            : false;

          return {
            ...product,
            featured: product.featured || false,
            isNew: product.isNew || isNewProduct,
          };
        });

        setProducts(processedProducts);

        const featured = processedProducts.filter((p) => p.featured);
        setFeaturedProducts(featured.length > 0 ? featured : processedProducts.slice(0, 4));

        const newest = processedProducts.filter((p) => p.isNew);
        setNewProducts(newest.length > 0 ? newest : processedProducts.slice(-4));
      } catch (error) {
        console.error('Error loading products on landing page:', error);
        setProducts([]);
        setFeaturedProducts([]);
        setNewProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const getProductImageSrc = (product) => {
    // Ưu tiên ảnh từ database (tên file trong public/img-product/)
    if (Array.isArray(product.images) && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (typeof imageUrl === 'string' && !imageUrl.includes('src/assets')) {
        return `http://localhost:8081/api/products/images/${imageUrl}`;
      }
      if (imageUrl?.imageUrl && !imageUrl.imageUrl.includes('src/assets')) {
        return `http://localhost:8081/api/products/images/${imageUrl.imageUrl}`;
      }
    }

    if (imageMap[product.name]) return imageMap[product.name];

    return 'https://via.placeholder.com/120x120/f0f0f0/666?text=Product';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { text: 'Đang bán', class: 'status-available' },
      HIDDEN: { text: 'Ẩn', class: 'status-hidden' },
      SOLD_OUT: { text: 'Hết hàng', class: 'status-sold' },
    };
    const info = statusMap[status] || { text: 'Không xác định', class: 'status-unknown' };
    return <span className={`product-status-badge ${info.class}`}>{info.text}</span>;
  };

  const matchesFilters = (product) => {
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const isSale = product.tradeType === 'BUY_ONLY' || product.tradeType === 'BOTH';
    const isRent = product.tradeType === 'RENT_ONLY' || product.tradeType === 'BOTH';

    const matchesType =
      filterType === 'all' ||
      (filterType === 'sale' && isSale) ||
      (filterType === 'rent' && isRent);

    return matchesSearch && matchesType;
  };

  const filteredFeaturedProducts = featuredProducts.filter(matchesFilters);
  const filteredNewProducts = newProducts.filter(matchesFilters);

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-card-inner">
        <div className="product-thumb">
          <img src={getProductImageSrc(product)} alt={product.name} />
        </div>

        <div className="product-info">
          <div className="product-meta-row">
            <span className="product-category-pill">
              {product.categoryName || product.category?.name || 'Danh mục khác'}
            </span>
            {getStatusBadge(product.status)}
          </div>

          <h3 className="product-name">{product.name}</h3>

          <div className="product-prices">
            {(product.tradeType === 'BOTH' || product.tradeType === 'BUY_ONLY') && product.buyPrice ? (
              <div className="price-main">{formatPrice(product.buyPrice)}</div>
            ) : null}
            {(product.tradeType === 'BOTH' || product.tradeType === 'RENT_ONLY') && product.rentPrice ? (
              <div className="price-rent">
                {formatPrice(product.rentPrice)}/
                {product.rentUnit === 'MONTH' ? 'tháng' : product.rentUnit === 'WEEK' ? 'tuần' : 'ngày'}
              </div>
            ) : null}
          </div>

          <div className="product-actions">
            {(product.tradeType === 'BOTH' || product.tradeType === 'BUY_ONLY') && product.buyPrice ? (
              <button className="btn-buy">Có Bán</button>
            ) : null}
            {(product.tradeType === 'BOTH' || product.tradeType === 'RENT_ONLY') && product.rentPrice ? (
              <button className="btn-rent">Có Thuê</button>
            ) : null}
          </div>

          <button className="btn-details" onClick={goToLogin}>
            Xem Chi Tiết
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <span className="landing-logo-icon">✨</span>
            <span className="landing-logo-text">MiMi</span>
          </div>
          <nav className="landing-nav-menu">
            <button className="landing-nav-link">Trang Chủ</button>
            <button className="landing-nav-link">Giới Thiệu</button>
            <button className="landing-nav-link">Liên Hệ</button>
          </nav>
          <div className="landing-auth-buttons">
            <button className="landing-login-btn" onClick={goToLogin}>
              Đăng Nhập
            </button>
            <button className="landing-register-btn" onClick={goToRegister}>
              Đăng Ký
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-text">
            <h1 className="landing-hero-title">
              Chào Mừng đến MiMi:
              <br />
              Chăm Sóc Toàn Diện Cho Bé Yêu!
            </h1>
            <p className="landing-hero-description">
              Khám phá hàng ngàn sản phẩm chất lượng cho bé, từ máy tiệt trùng bình
              sữa hiện đại đến máy hút sữa thông minh, đồ dùng thiết yếu và đồ chơi
              sáng tạo. Mua sắm hoặc thuê, MiMi luôn có những lựa chọn hoàn hảo cho
              gia đình bạn.
            </p>
            <button className="landing-hero-button" onClick={goToLogin}>
              Khám Phá Ngay
            </button>
          </div>
          <div className="landing-hero-image">
            <div className="landing-hero-image-card">
              {/* Placeholder image area – bạn có thể thay bằng ảnh thật */}
              <div className="landing-hero-image-placeholder" />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="landing-search-section">
        <div className="landing-search-content">
          <h2 className="landing-search-title">Tìm Kiếm Sản Phẩm MiMi</h2>
          <div className="landing-search-bar-container">
            <Search className="landing-search-icon" size={20} />
            <input
              type="text"
              className="landing-search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="landing-filter-buttons">
            <button
              className={`landing-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả
            </button>
            <button
              className={`landing-filter-btn ${filterType === 'sale' ? 'active' : ''}`}
              onClick={() => setFilterType('sale')}
            >
              Sản phẩm Bán
            </button>
            <button
              className={`landing-filter-btn ${filterType === 'rent' ? 'active' : ''}`}
              onClick={() => setFilterType('rent')}
            >
              Sản phẩm Thuê
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section - giống HomePage khi đã đăng nhập */}
      <section className="home-products-section">
        <div className="home-products-content">
          <h2 className="home-section-title">Sản Phẩm Nổi Bật</h2>
          {loading ? (
            <div className="loading-message">Đang tải sản phẩm...</div>
          ) : (
            <div className="products-grid">
              {filteredFeaturedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Products Section */}
      <section className="home-products-section">
        <div className="home-products-content">
          <h2 className="home-section-title">Sản Phẩm Mới</h2>
          {loading ? (
            <div className="loading-message">Đang tải sản phẩm...</div>
          ) : (
            <div className="products-grid">
              {filteredNewProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

