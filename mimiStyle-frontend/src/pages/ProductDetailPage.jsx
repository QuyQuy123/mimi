import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getProductById } from '../api/product';
import { API_ORIGIN } from '../api/config';
import { useCart } from '../context/CartContext';
import sterilizerImg from '../assets/img-product/may-tiet-trung-binh-sua-co-say-kho-bang-tia-uv-spectra-1.jpg';
import pumpImg from '../assets/img-product/May-hut-sua-dien-doi-Resonance-3-Fb1160VN-3.jpeg';
import cribImg from '../assets/img-product/top-5-thuong-hieu-noi-cho-be-duoc-ua-chuong-nhat-hien-nay-2020-1595675197.png';
import strollerImg from '../assets/img-product/xe-day-tre-em-joie-versatrax-lagoon.jpg';
import chairImg from '../assets/img-product/ghe-an-dam-umoo-1606186868.jpg';
import toyImg from '../assets/img-product/z6021933351086_28eb8d7e91cc13e47c6e338d1bea00f3.jpg';
import '../styles/ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart, isInCart } = useCart();

  const imageMap = {
    'Máy tiệt trùng bình sữa UV': sterilizerImg,
    'Máy hút sữa điện tử thông minh': pumpImg,
    'Nôi em bé thông minh': cribImg,
    'Xe đẩy em bé cao cấp': strollerImg,
    'Ghế ăn dặm cho bé': chairImg,
    'Bộ đồ chơi giáo dục': toyImg,
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Không thể tải chi tiết sản phẩm');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const getProductImageSrc = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (typeof imageUrl === 'string' && !imageUrl.includes('src/assets')) {
        return `${API_ORIGIN}/api/products/images/${imageUrl}`;
      }
      if (imageUrl?.imageUrl && !imageUrl.imageUrl.includes('src/assets')) {
        return `${API_ORIGIN}/api/products/images/${imageUrl.imageUrl}`;
      }
    }

    // Fallback: dùng ảnh tĩnh theo tên sản phẩm (dữ liệu mẫu)
    if (product?.name && imageMap[product.name]) {
      return imageMap[product.name];
    }

    // Fallback cuối cùng: placeholder
    return 'https://via.placeholder.com/600x600/f0f0f0/666?text=Product+Image';
  };

  const getThumbSrc = (img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      if (img.includes('src/assets')) return null;
      return `${API_ORIGIN}/api/products/images/${img}`;
    }
    if (img.imageUrl) {
      if (img.imageUrl.includes('src/assets')) return null;
      return `${API_ORIGIN}/api/products/images/${img.imageUrl}`;
    }
    return null;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      product,
      quantity,
      colorLabel: colors[selectedColor] ? `Màu ${selectedColor + 1}` : '',
      sizeLabel: sizes[selectedSize] || '',
      colorIndex: selectedColor,
      sizeIndex: selectedSize,
      imageSrc: getProductImageSrc(product),
    });
  };

  const addedToCart = isInCart(product?.id, selectedColor, selectedSize);

  if (loading) {
    return (
      <Layout>
        <div className="product-detail-loading">Đang tải...</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="product-detail-error">Không tìm thấy sản phẩm</div>
      </Layout>
    );
  }

  // Mock colors and sizes - trong thực tế sẽ lấy từ product data
  const colors = ['#87CEEB', '#FFB6C1', '#9370DB'];
  const sizes = ['3M', '6M', '9M', '12M'];

  return (
    <Layout>
      <div className="product-detail-page">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <button onClick={() => navigate('/home')}>Trang chủ</button>
          <ChevronRight size={16} />
          <button onClick={() => navigate('/home')}>Sản phẩm</button>
          <ChevronRight size={16} />
          <span>{product.name}</span>
        </div>

        {/* Product Content */}
        <div className="product-detail-content">
          {/* Left: Product Images */}
          <div className="product-images-section">
            <div className="main-image">
              <img src={getProductImageSrc(product)} alt={product.name} />
            </div>
            <div className="thumbnail-images">
              {(() => {
                const thumbs = Array.isArray(product.images)
                  ? product.images.map(getThumbSrc).filter(Boolean).slice(0, 2)
                  : [];

                // Nếu không có thumbnail hợp lệ thì không render gì (tránh hiện ảnh lỗi + chữ)
                if (thumbs.length === 0) return null;

                return thumbs.map((src, idx) => (
                  <div key={idx} className="thumbnail">
                    <img src={src} alt={`${product.name} ${idx + 1}`} />
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-details-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-status">
              <span className="status-badge available">Còn hàng</span>
            </div>

            <div className="product-price">
              {product.buyPrice ? formatPrice(product.buyPrice) : formatPrice(product.rentPrice || 0)}
            </div>

            {/* Color Selection */}
            <div className="product-option-group">
              <label className="option-label">Màu sắc</label>
              <div className="color-options">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`color-swatch ${selectedColor === idx ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="product-option-group">
              <label className="option-label">Kích thước</label>
              <div className="size-options">
                {sizes.map((size, idx) => (
                  <button
                    key={idx}
                    className={`size-button ${selectedSize === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(idx)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <a href="#" className="size-guide-link">Hướng dẫn chọn size</a>
            </div>

            {/* Quantity */}
            <div className="product-option-group">
              <label className="option-label">Số lượng</label>
              <div className="quantity-selector">
                <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart / Checkout Button */}
            {addedToCart ? (
              <button className="add-to-cart-btn checkout-btn" onClick={() => navigate('/checkout')}>
                Thanh toán
              </button>
            ) : (
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
            )}
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs-section">
          <div className="product-tabs">
            <button
              className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Mô tả
            </button>
            <button
              className={`tab-button ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Thông số kỹ thuật
            </button>
            <button
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá sản phẩm
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <p>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="specs-content">
                <p>Thông số kỹ thuật sẽ được cập nhật sau.</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
