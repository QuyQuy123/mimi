import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getAllProducts } from '../api/product';
import { API_ORIGIN } from '../api/config';
import sterilizerImg from '../assets/img-product/may-tiet-trung-binh-sua-co-say-kho-bang-tia-uv-spectra-1.jpg';
import pumpImg from '../assets/img-product/May-hut-sua-dien-doi-Resonance-3-Fb1160VN-3.jpeg';
import cribImg from '../assets/img-product/top-5-thuong-hieu-noi-cho-be-duoc-ua-chuong-nhat-hien-nay-2020-1595675197.png';
import strollerImg from '../assets/img-product/xe-day-tre-em-joie-versatrax-lagoon.jpg';
import chairImg from '../assets/img-product/ghe-an-dam-umoo-1606186868.jpg';
import toyImg from '../assets/img-product/z6021933351086_28eb8d7e91cc13e47c6e338d1bea00f3.jpg';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'sale', 'rent'
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

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (!savedUser) {
      navigate('/login', { replace: true });
    } else {
      loadProducts();
    }
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getAllProducts();
      
      // Process products to determine if they are new (created within last 7 days)
      const processedProducts = allProducts.map(product => {
        const isNewProduct = product.createdAt ? 
          (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) <= 7 : false;
        
        return {
          ...product,
          featured: product.featured || false,
          isNew: product.isNew || isNewProduct, // Use database flag or calculate based on date
        };
      });
      
      setProducts(processedProducts);
      
      // Get featured products, if none exist, show first 4 products as featured
      const featuredProducts = processedProducts.filter(product => product.featured);
      setFeaturedProducts(featuredProducts.length > 0 ? featuredProducts : processedProducts.slice(0, 4));
      
      // Get new products, if none exist, show last 4 products as new
      const newProducts = processedProducts.filter(product => product.isNew);
      setNewProducts(newProducts.length > 0 ? newProducts : processedProducts.slice(-4));
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to empty arrays if API fails
      setProducts([]);
      setFeaturedProducts([]);
      setNewProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getProductImageSrc = (product) => {
    // Ưu tiên ảnh từ database (tên file trong public/img-product/)
    if (Array.isArray(product.images) && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (typeof imageUrl === 'string' && !imageUrl.includes('src/assets')) {
        // Tên file từ database, load từ /img-product/
        return `http://localhost:8081/api/products/images/${imageUrl}`;
      }
      // Nếu là object có imageUrl
      if (imageUrl?.imageUrl && !imageUrl.imageUrl.includes('src/assets')) {
        return `http://localhost:8081/api/products/images/${imageUrl.imageUrl}`;
      }
    }

    // Fallback: dùng imageMap nếu có
    if (imageMap[product.name]) return imageMap[product.name];

    // Fallback cuối cùng: placeholder
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

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-card-inner">
        <div className="product-thumb">
          <img src={getProductImageSrc(product)} alt={product.name} />
          <button className="product-favorite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
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

          <button className="btn-details" onClick={() => navigate(`/product/${product.id}`)}>
            Xem Chi Tiết
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="home-container">

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Chào Mừng đến MiMi: Chăm Sóc Toàn Diện Cho Bé Yêu!
          </h1>
          <p className="home-hero-description">
            Khám phá hàng ngàn sản phẩm chất lượng cho bé, từ máy tiệt trùng bình sữa hiện đại đến máy hút sữa thông minh, đồ dùng thiết yếu và đồ chơi sáng tạo. Mua sắm hoặc thuê, MiMi luôn có những lựa chọn hoàn hảo cho gia đình bạn.
          </p>
          <button className="home-hero-button">Khám Phá Ngay</button>
        </div>
      </section>

      {/* Search Section */}
      <section className="home-search-section">
        <div className="home-search-content">
          <h2 className="home-search-title">Tìm Kiếm Sản Phẩm MiMi</h2>
          <div className="home-search-bar-container">
            <Search className="home-search-icon" size={20} />
            <input
              type="text"
              className="home-search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="home-filter-buttons">
            <button
              className={`home-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả
            </button>
            <button
              className={`home-filter-btn ${filterType === 'sale' ? 'active' : ''}`}
              onClick={() => setFilterType('sale')}
            >
              Sản phẩm Bán
            </button>
            <button
              className={`home-filter-btn ${filterType === 'rent' ? 'active' : ''}`}
              onClick={() => setFilterType('rent')}
            >
              Sản phẩm Thuê
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="home-products-section">
        <div className="home-products-content">
          <h2 className="home-section-title">Sản Phẩm Nổi Bật</h2>
          {loading ? (
            <div className="loading-message">Đang tải sản phẩm...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
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
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
    </Layout>
  );
}
