import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getUserProducts, deleteProduct, updateProduct, uploadProductImages, saveProductImageNames, deleteProductImage } from '../api/product';
import { API_ORIGIN } from '../api/config';
import sterilizerImg from '../assets/img-product/may-tiet-trung-binh-sua-co-say-kho-bang-tia-uv-spectra-1.jpg';
import pumpImg from '../assets/img-product/May-hut-sua-dien-doi-Resonance-3-Fb1160VN-3.jpeg';
import cribImg from '../assets/img-product/top-5-thuong-hieu-noi-cho-be-duoc-ua-chuong-nhat-hien-nay-2020-1595675197.png';
import strollerImg from '../assets/img-product/xe-day-tre-em-joie-versatrax-lagoon.jpg';
import chairImg from '../assets/img-product/ghe-an-dam-umoo-1606186868.jpg';
import toyImg from '../assets/img-product/z6021933351086_28eb8d7e91cc13e47c6e338d1bea00f3.jpg';
import '../styles/ProductManagementPage.css';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    tradeType: 'BUY_ONLY',
    condition: 'NEW',
    price: '',
    rentPrice: '',
    rentUnit: 'MONTH',
    address: '',
    status: 'ACTIVE',
    images: [],
    imageFilenames: []
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitError, setEditSubmitError] = useState('');
  const [editSuccessMessage, setEditSuccessMessage] = useState('');

  // Tạm thời mock user ID - sau này sẽ lấy từ user trong session
  const userId = 1;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getUserProducts(userId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      // Mock data for demo
      setProducts([
        {
          id: 1,
          name: 'Nôi em bé đa năng',
          buyPrice: 3500000,
          rentPrice: null,
          status: 'ACTIVE',
          tradeType: 'BUY_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 2,
          name: 'Xe đẩy em bé cao cấp',
          buyPrice: null,
          rentPrice: 1800000,
          rentUnit: 'MONTH',
          status: 'ACTIVE',
          tradeType: 'RENT_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 3,
          name: 'Bộ bình sữa tiện lợi',
          buyPrice: 450000,
          rentPrice: null,
          status: 'ACTIVE',
          tradeType: 'BUY_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 4,
          name: 'Ghế ăn dặm cho bé',
          buyPrice: null,
          rentPrice: 700000,
          rentUnit: 'MONTH',
          status: 'ACTIVE',
          tradeType: 'RENT_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 5,
          name: 'Set quần áo sơ sinh',
          buyPrice: 250000,
          rentPrice: null,
          status: 'ACTIVE',
          tradeType: 'BUY_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 6,
          name: 'Bồn tắm cho bé',
          buyPrice: 300000,
          rentPrice: 50000,
          rentUnit: 'MONTH',
          status: 'ACTIVE',
          tradeType: 'BOTH',
          images: ['/api/placeholder/300/200']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Không thể xóa sản phẩm');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      tradeType: product.tradeType || 'BUY_ONLY',
      condition: getConditionFromPercentage(product.conditionPercentage),
      price: product.buyPrice ? product.buyPrice.toString() : '',
      rentPrice: product.rentPrice ? product.rentPrice.toString() : '',
      rentUnit: product.rentUnit || 'MONTH',
      address: product.addressContact || '',
      status: product.status || 'ACTIVE',
      images: [],
      imageFilenames: [],
      existingImages: product.images || []
    });
    setIsEditing(true);
    setEditErrors({});
    setEditSubmitError('');
    setEditSuccessMessage('');
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setEditFormData({
      name: '',
      description: '',
      tradeType: 'BUY_ONLY',
      condition: 'NEW',
      price: '',
      rentPrice: '',
      rentUnit: 'MONTH',
      address: '',
      status: 'ACTIVE',
      images: [],
      imageFilenames: [],
      existingImages: []
    });
    setEditErrors({});
    setEditSubmitError('');
    setEditSuccessMessage('');
  };

  const getConditionFromPercentage = (percentage) => {
    if (percentage === 100) return 'NEW';
    if (percentage >= 90) return 'LIKE_NEW';
    return 'USED';
  };

  const getConditionPercentage = (condition) => {
    switch (condition) {
      case 'NEW': return 100;
      case 'LIKE_NEW': return 90;
      case 'USED': return 70;
      default: return 100;
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditTradeTypeChange = (type) => {
    setEditFormData(prev => ({
      ...prev,
      tradeType: type
    }));
  };

  const handleEditConditionChange = (condition) => {
    setEditFormData(prev => ({
      ...prev,
      condition: condition
    }));
  };

  const handleEditImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    try {
      // Upload ảnh lên server và lưu vào thư mục frontend
      const uploadedFilenames = await uploadProductImages(files);
      
      setEditFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files],
        imageFilenames: [...(prev.imageFilenames || []), ...uploadedFilenames]
      }));
      
      console.log('Đã upload thành công:', uploadedFilenames);
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      setEditSubmitError('Lỗi khi upload ảnh: ' + error.message);
    }
  };

  const removeEditImage = (indexToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
      imageFilenames: prev.imageFilenames?.filter((_, index) => index !== indexToRemove) || []
    }));
  };

  const removeExistingImage = async (imageToRemove) => {
    // Xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác.')) {
      return;
    }
    
    try {
      // Xóa ảnh khỏi server và database
      await deleteProductImage(editingProduct.id, imageToRemove);
      
      // Cập nhật state để remove ảnh khỏi UI
      setEditFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages?.filter(img => 
          (typeof img === 'string' ? img : img.imageUrl) !== imageToRemove
        ) || []
      }));
      
      console.log('Đã xóa ảnh thành công:', imageToRemove);
    } catch (error) {
      console.error('Lỗi khi xóa ảnh:', error);
      setEditSubmitError('Lỗi khi xóa ảnh: ' + error.message);
    }
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editFormData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!editFormData.description.trim()) {
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    }

    if (!editFormData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (editFormData.tradeType === 'BUY_ONLY' || editFormData.tradeType === 'BOTH') {
      if (!editFormData.price || parseFloat(editFormData.price) <= 0) {
        newErrors.price = 'Giá bán phải lớn hơn 0';
      }
    }

    if (editFormData.tradeType === 'RENT_ONLY' || editFormData.tradeType === 'BOTH') {
      if (!editFormData.rentPrice || parseFloat(editFormData.rentPrice) <= 0) {
        newErrors.rentPrice = 'Giá thuê phải lớn hơn 0';
      }
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitError('');
    setEditSuccessMessage('');

    if (!validateEditForm()) {
      setEditSubmitError('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setEditLoading(true);

    try {
      const productData = {
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        buyPrice: editFormData.tradeType === 'RENT_ONLY' ? null : parseFloat(editFormData.price) || null,
        rentPrice: editFormData.tradeType === 'BUY_ONLY' ? null : parseFloat(editFormData.rentPrice) || null,
        rentUnit: editFormData.tradeType === 'BUY_ONLY' ? null : editFormData.rentUnit,
        tradeType: editFormData.tradeType,
        conditionPercentage: getConditionPercentage(editFormData.condition),
        addressContact: editFormData.address.trim(),
        status: editFormData.status
      };

      await updateProduct(editingProduct.id, productData);
      
      // Lưu ảnh mới nếu có
      if (editFormData.imageFilenames && editFormData.imageFilenames.length > 0) {
        try {
          await saveProductImageNames(editingProduct.id, editFormData.imageFilenames);
        } catch (imageError) {
          console.error('Error saving image filenames:', imageError);
          setEditSubmitError('Sản phẩm đã được cập nhật nhưng có lỗi khi lưu ảnh: ' + imageError.message);
          setEditLoading(false);
          return;
        }
      }
      
      setEditSuccessMessage('Sản phẩm đã được cập nhật thành công!');
      
      // Reload products after 1 second
      setTimeout(() => {
        loadProducts();
        handleCloseEdit();
      }, 1000);
    } catch (error) {
      console.error('Error updating product:', error);
      setEditSubmitError(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setEditLoading(false);
    }
  };

  const imageMap = {
    'Máy tiệt trùng bình sữa UV': sterilizerImg,
    'Máy hút sữa điện tử thông minh': pumpImg,
    'Nôi em bé thông minh': cribImg,
    'Xe đẩy em bé cao cấp': strollerImg,
    'Ghế ăn dặm cho bé': chairImg,
    'Bộ đồ chơi giáo dục': toyImg,
  };

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

    // Fallback: dùng imageMap nếu có
    if (imageMap[product.name]) return imageMap[product.name];

    // Fallback cuối cùng: placeholder
    return '/api/placeholder/300/200';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { text: 'Đang bán', class: 'status-available' },
      'HIDDEN': { text: 'Ẩn', class: 'status-hidden' },
      'SOLD_OUT': { text: 'Hết hàng', class: 'status-sold' }
    };
    const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'status-unknown' };
    return <span className={`product-status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getRentUnitText = (unit) => {
    const unitMap = {
      'DAY': 'ngày',
      'WEEK': 'tuần', 
      'MONTH': 'tháng',
      'YEAR': 'năm'
    };
    return unitMap[unit] || 'tháng';
  };

  const content = loading ? (
    <div className="loading">Đang tải...</div>
  ) : (
    <>
      <main className="main-content">
        <div className="page-header">
          <h1>Quản lý sản phẩm</h1>
          <p className="subtitle">Sản phẩm đang bán/cho thuê</p>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-card-inner">
                <div className="product-thumb">
                  <img src={getProductImageSrc(product)} alt={product.name} />
                </div>

                <div className="product-info">
                  <div className="product-meta-row">
                    {/* TODO: thay bằng tên thể loại từ API nếu có */}
                    <span className="product-category-pill">
                      {product.categoryName || product.category?.name || 'Danh mục khác'}
                    </span>
                    {getStatusBadge(product.status)}
                  </div>

                  <h3 className="product-name">{product.name}</h3>
                
                  <div className="product-price">
                  {product.tradeType === 'BUY_ONLY' && product.buyPrice && (
                    <span className="sell-price">{formatPrice(product.buyPrice)}</span>
                  )}
                  {product.tradeType === 'RENT_ONLY' && product.rentPrice && (
                    <span className="rent-price">
                      {formatPrice(product.rentPrice)}/{getRentUnitText(product.rentUnit)}
                    </span>
                  )}
                  {product.tradeType === 'BOTH' && (
                    <>
                      {product.buyPrice && <span className="sell-price">{formatPrice(product.buyPrice)}</span>}
                      {product.rentPrice && (
                        <span className="rent-price">
                          {formatPrice(product.rentPrice)}/{getRentUnitText(product.rentUnit)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                  <div className="product-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="add-product-section">
          <button 
            className="btn-add-product"
            onClick={() => navigate('/add')}
          >
            + Tải thêm sản phẩm
          </button>
        </div>
      </main>

      <nav className="bottom-nav">
        <a href="/revenue" className="nav-item">
          <span className="nav-icon">💰</span>
          <span className="nav-text">Doanh thu</span>
        </a>
        <a href="/products" className="nav-item active">
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Đang bán</span>
        </a>
        <a href="/add" className="nav-item">
          <span className="nav-icon">➕</span>
          <span className="nav-text">Thêm mới</span>
        </a>
      </nav>

      {/* Edit Product Modal */}
      {isEditing && (
        <div className="edit-modal-overlay" onClick={handleCloseEdit}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Chỉnh sửa sản phẩm</h2>
              <button className="close-button" onClick={handleCloseEdit}>×</button>
            </div>

            <form onSubmit={handleEditSubmit} className="edit-product-form">
              {editSubmitError && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{editSubmitError}</span>
                </div>
              )}

              {editSuccessMessage && (
                <div className="success-banner">
                  <span className="success-icon">✅</span>
                  <span className="success-text">{editSuccessMessage}</span>
                </div>
              )}

              {/* Thông tin cơ bản */}
              <section className="form-section">
                <h3 className="section-title">Thông tin cơ bản sản phẩm</h3>

                <div className="form-group">
                  <label className="form-label">
                    <span className="required">*</span> Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.name ? 'error' : ''}`}
                    required
                  />
                  {editErrors.name && <div className="field-error">{editErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Loại hình</label>
                  <div className="radio-group">
                    <button
                      type="button"
                      className={`radio-option ${editFormData.tradeType === 'BUY_ONLY' ? 'active' : ''}`}
                      onClick={() => handleEditTradeTypeChange('BUY_ONLY')}
                    >
                      <span className="radio-icon">💰</span>
                      <div>
                        <div className="radio-title">Bán</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`radio-option ${editFormData.tradeType === 'RENT_ONLY' ? 'active' : ''}`}
                      onClick={() => handleEditTradeTypeChange('RENT_ONLY')}
                    >
                      <span className="radio-icon">🔄</span>
                      <div>
                        <div className="radio-title">Cho thuê</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`radio-option ${editFormData.tradeType === 'BOTH' ? 'active' : ''}`}
                      onClick={() => handleEditTradeTypeChange('BOTH')}
                    >
                      <span className="radio-icon">💎</span>
                      <div>
                        <div className="radio-title">Cả hai</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Điều kiện</label>
                  <div className="condition-group">
                    <button
                      type="button"
                      className={`condition-option ${editFormData.condition === 'NEW' ? 'active' : ''}`}
                      onClick={() => handleEditConditionChange('NEW')}
                    >
                      <span className="condition-icon">✨</span>
                      <div>
                        <div className="condition-title">Mới</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`condition-option ${editFormData.condition === 'LIKE_NEW' ? 'active' : ''}`}
                      onClick={() => handleEditConditionChange('LIKE_NEW')}
                    >
                      <span className="condition-icon">🌟</span>
                      <div>
                        <div className="condition-title">Như mới</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`condition-option ${editFormData.condition === 'USED' ? 'active' : ''}`}
                      onClick={() => handleEditConditionChange('USED')}
                    >
                      <span className="condition-icon">🔧</span>
                      <div>
                        <div className="condition-title">Đã sử dụng</div>
                      </div>
                    </button>
                  </div>
                </div>
              </section>

              {/* Chi tiết sản phẩm */}
              <section className="form-section">
                <h3 className="section-title">Chi tiết sản phẩm</h3>

                <div className="form-group">
                  <label className="form-label">
                    <span className="required">*</span> Mô tả sản phẩm
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className={`form-textarea ${editErrors.description ? 'error' : ''}`}
                    rows={4}
                    required
                  />
                  {editErrors.description && <div className="field-error">{editErrors.description}</div>}
                </div>

                <div className="price-group">
                  {(editFormData.tradeType === 'BUY_ONLY' || editFormData.tradeType === 'BOTH') && (
                    <div className="form-group">
                      <label className="form-label">
                        <span className="required">*</span> Giá bán (VNĐ)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditInputChange}
                        className={`form-input ${editErrors.price ? 'error' : ''}`}
                        min="0"
                      />
                      {editErrors.price && <div className="field-error">{editErrors.price}</div>}
                    </div>
                  )}

                  {(editFormData.tradeType === 'RENT_ONLY' || editFormData.tradeType === 'BOTH') && (
                    <div className="rent-price-group">
                      <div className="form-group">
                        <label className="form-label">
                          <span className="required">*</span> Giá thuê (VNĐ)
                        </label>
                        <input
                          type="number"
                          name="rentPrice"
                          value={editFormData.rentPrice}
                          onChange={handleEditInputChange}
                          className={`form-input ${editErrors.rentPrice ? 'error' : ''}`}
                          min="0"
                        />
                        {editErrors.rentPrice && <div className="field-error">{editErrors.rentPrice}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Đơn vị thời gian</label>
                        <select
                          name="rentUnit"
                          value={editFormData.rentUnit}
                          onChange={handleEditInputChange}
                          className="form-select"
                        >
                          <option value="DAY">Ngày</option>
                          <option value="WEEK">Tuần</option>
                          <option value="MONTH">Tháng</option>
                          <option value="YEAR">Năm</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Hình ảnh sản phẩm */}
              <section className="form-section">
                <h3 className="section-title">Hình ảnh sản phẩm</h3>
                
                {/* Ảnh hiện tại */}
                {editFormData.existingImages && editFormData.existingImages.length > 0 && (
                  <div className="existing-images">
                    <h4 className="subsection-title">Ảnh hiện tại</h4>
                    <div className="image-preview-grid">
                      {editFormData.existingImages.map((img, index) => {
                        const imageUrl = typeof img === 'string' ? img : img.imageUrl;
                        return (
                          <div key={`existing-${index}`} className="image-preview-item">
                            <button 
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeExistingImage(imageUrl)}
                              title="Xóa ảnh vĩnh viễn"
                            >
                              <X size={12} />
                            </button>
                            <img 
                              src={getProductImageSrc({images: [img]})}
                              alt={`Existing ${index + 1}`}
                              className="preview-image"
                            />
                            <div className="image-info">
                              <span className="image-name">{imageUrl}</span>
                              {index === 0 && <span className="thumbnail-badge">Ảnh đại diện</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload ảnh mới */}
                <div className="new-images">
                  <h4 className="subsection-title">Thêm ảnh mới</h4>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="edit-images"
                      multiple
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="upload-input"
                    />
                    <label htmlFor="edit-images" className="upload-label">
                      <Upload size={32} className="upload-icon" />
                      <div className="upload-text">
                        <div>Kéo & thả nhiều ảnh vào đây hoặc bấm để chọn</div>
                        <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '4px'}}>
                          Hỗ trợ JPG, PNG, GIF. Có thể chọn nhiều ảnh cùng lúc.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Preview ảnh mới */}
                  {editFormData.images.length > 0 && (
                    <div className="uploaded-files">
                      <p>{editFormData.images.length} ảnh mới đã chọn</p>
                      <div className="image-preview-grid">
                        {editFormData.images.map((file, index) => (
                          <div key={`new-${index}`} className="image-preview-item">
                            <button 
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeEditImage(index)}
                              title="Xóa ảnh"
                            >
                              <X size={12} />
                            </button>
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`New Preview ${index + 1}`}
                              className="preview-image"
                            />
                            <div className="image-info">
                              <span className="image-name">{file.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="upload-hint">
                        ✅ Ảnh sẽ được tự động lưu vào thư mục <code>src/assets/img-product/</code>
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Địa chỉ */}
              <section className="form-section">
                <h3 className="section-title">Địa chỉ</h3>
                <div className="form-group">
                  <label className="form-label">
                    <span className="required">*</span> Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.address ? 'error' : ''}`}
                    required
                  />
                  {editErrors.address && <div className="field-error">{editErrors.address}</div>}
                </div>
              </section>

              {/* Trạng thái */}
              <section className="form-section">
                <h3 className="section-title">Trạng thái</h3>
                <div className="form-group">
                  <label className="form-label">Trạng thái sản phẩm</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="form-select"
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="HIDDEN">Ẩn</option>
                    <option value="SOLD_OUT">Hết hàng</option>
                  </select>
                </div>
              </section>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseEdit}
                  disabled={editLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={editLoading}
                >
                  {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Layout>
      <div className="product-management">
        {content}
      </div>
    </Layout>
  );
};

export default ProductManagementPage;