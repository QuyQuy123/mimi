import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { createProduct, saveProductImageNames, uploadProductImages } from '../api/product';
import '../styles/AddProductPage.css';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    tradeType: 'BUY_ONLY', // BUY_ONLY, RENT_ONLY, BOTH
    condition: 'NEW', // NEW, USED, LIKE_NEW
    description: '',
    price: '',
    rentPrice: '',
    rentUnit: 'MONTH',
    address: '',
    images: [],
    imageFilenames: [],
    certificates: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTradeTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      tradeType: type
    }));
  };

  const handleConditionChange = (condition) => {
    setFormData(prev => ({
      ...prev,
      condition: condition
    }));
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
      imageFilenames: prev.imageFilenames?.filter((_, index) => index !== indexToRemove) || []
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    try {
      // Upload ảnh lên server và lưu vào thư mục frontend
      const uploadedFilenames = await uploadProductImages(files);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files],
        imageFilenames: [...(prev.imageFilenames || []), ...uploadedFilenames]
      }));
      
      console.log('Đã upload thành công:', uploadedFilenames);
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      alert('Lỗi khi upload ảnh: ' + error.message);
    }
  };

  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, ...files]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    // Validate price based on trade type
    if (formData.tradeType === 'BUY_ONLY' || formData.tradeType === 'BOTH') {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Giá bán phải lớn hơn 0';
      }
    }

    if (formData.tradeType === 'RENT_ONLY' || formData.tradeType === 'BOTH') {
      if (!formData.rentPrice || parseFloat(formData.rentPrice) <= 0) {
        newErrors.rentPrice = 'Giá thuê phải lớn hơn 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      setSubmitError('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API - Don't send seller and category objects
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        buyPrice: formData.tradeType === 'RENT_ONLY' ? null : parseFloat(formData.price) || null,
        rentPrice: formData.tradeType === 'BUY_ONLY' ? null : parseFloat(formData.rentPrice) || null,
        rentUnit: formData.tradeType === 'BUY_ONLY' ? null : formData.rentUnit,
        tradeType: formData.tradeType,
        conditionPercentage: getConditionPercentage(formData.condition),
        addressContact: formData.address.trim(),
        status: 'ACTIVE'
        // Note: seller and category will be handled by backend
      };

      console.log('Sending product data:', productData);
      const createdProduct = await createProduct(productData);
      
      // Save image filenames to database if any
      if (formData.imageFilenames && formData.imageFilenames.length > 0) {
        try {
          await saveProductImageNames(createdProduct.id, formData.imageFilenames);
        } catch (imageError) {
          console.error('Error saving image filenames:', imageError);
          // Don't fail the whole operation if image save fails
          setSubmitError('Sản phẩm đã được tạo nhưng có lỗi khi lưu tên ảnh: ' + imageError.message);
        }
      }
      
      // Show success message
      setSuccessMessage('Sản phẩm đã được tạo thành công!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (error) {
      console.error('Error creating product:', error);
      setSubmitError(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const getConditionPercentage = (condition) => {
    switch (condition) {
      case 'NEW': return 100;
      case 'LIKE_NEW': return 90;
      case 'USED': return 70;
      default: return 100;
    }
  };

  const content = (
    <>
      <main className="main-content">
        <div className="page-header">
          <h1>Thêm Sản Phẩm Mới</h1>
          <p className="subtitle">Điền thông tin chi tiết về sản phẩm em bé bạn muốn thêm vào cửa hàng MIMI.</p>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {/* Error Message */}
          {submitError && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{submitError}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="success-banner">
              <span className="success-icon">✅</span>
              <span className="success-text">{successMessage}</span>
            </div>
          )}
          {/* Thông tin cơ bản sản phẩm */}
          <section className="form-section">
            <h2 className="section-title">Thông tin cơ bản sản phẩm</h2>
            <p className="section-subtitle">Cung cấp tên và thông tin cơ bản về sản phẩm của bạn</p>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Xe đẩy em bé cao cấp"
                className={`form-input ${errors.name ? 'error' : ''}`}
                required
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Loại hình</label>
              <div className="radio-group">
                <button
                  type="button"
                  className={`radio-option ${formData.tradeType === 'BUY_ONLY' ? 'active' : ''}`}
                  onClick={() => handleTradeTypeChange('BUY_ONLY')}
                >
                  <span className="radio-icon">💰</span>
                  <div>
                    <div className="radio-title">Bán</div>
                    <div className="radio-subtitle">Sản phẩm được bán một lần</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`radio-option ${formData.tradeType === 'RENT_ONLY' ? 'active' : ''}`}
                  onClick={() => handleTradeTypeChange('RENT_ONLY')}
                >
                  <span className="radio-icon">🔄</span>
                  <div>
                    <div className="radio-title">Cho thuê</div>
                    <div className="radio-subtitle">Sản phẩm cho thuê theo thời gian</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`radio-option ${formData.tradeType === 'BOTH' ? 'active' : ''}`}
                  onClick={() => handleTradeTypeChange('BOTH')}
                >
                  <span className="radio-icon">💎</span>
                  <div>
                    <div className="radio-title">Cả hai</div>
                    <div className="radio-subtitle">Sản phẩm có thể bán hoặc cho thuê</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Điều kiện</label>
              <div className="condition-group">
                <button
                  type="button"
                  className={`condition-option ${formData.condition === 'NEW' ? 'active' : ''}`}
                  onClick={() => handleConditionChange('NEW')}
                >
                  <span className="condition-icon">✨</span>
                  <div>
                    <div className="condition-title">Mới</div>
                    <div className="condition-subtitle">Sản phẩm hoàn toàn mới</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`condition-option ${formData.condition === 'LIKE_NEW' ? 'active' : ''}`}
                  onClick={() => handleConditionChange('LIKE_NEW')}
                >
                  <span className="condition-icon">🌟</span>
                  <div>
                    <div className="condition-title">Như mới</div>
                    <div className="condition-subtitle">Sản phẩm đã sử dụng ít</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`condition-option ${formData.condition === 'USED' ? 'active' : ''}`}
                  onClick={() => handleConditionChange('USED')}
                >
                  <span className="condition-icon">🔧</span>
                  <div>
                    <div className="condition-title">Đã sử dụng</div>
                    <div className="condition-subtitle">Sản phẩm có dấu hiệu sử dụng</div>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Hình ảnh sản phẩm */}
          <section className="form-section">
            <h2 className="section-title">Hình ảnh sản phẩm</h2>
            <p className="section-subtitle">Thêm nhiều ảnh sản phẩm của bạn. Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện. Bạn có thể chọn nhiều ảnh cùng lúc.</p>
            
            <div className="upload-area">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
              />
              <label htmlFor="images" className="upload-label">
                <Upload size={48} className="upload-icon" />
                <div className="upload-text">
                  <div>Kéo & thả nhiều ảnh vào đây hoặc bấm để chọn</div>
                  <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '4px'}}>Hỗ trợ JPG, PNG, GIF. Có thể chọn nhiều ảnh cùng lúc.</div>
                </div>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="uploaded-files">
                <p>{formData.images.length} ảnh đã chọn</p>
                <div className="image-preview-grid">
                  {formData.images.map((file, index) => (
                    <div key={index} className="image-preview-item">
                      <button 
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        title="Xóa ảnh"
                      >
                        ×
                      </button>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                      />
                      <div className="image-info">
                        <span className="image-name">{file.name}</span>
                        {index === 0 && <span className="thumbnail-badge">Ảnh đại diện</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="upload-hint">
                  ✅ Ảnh sẽ được tự động lưu vào thư mục <code>src/assets/img-product/</code>
                </p>
              </div>
            )}
          </section>

          {/* Chi tiết sản phẩm */}
          <section className="form-section">
            <h2 className="section-title">Chi tiết sản phẩm</h2>
            <p className="section-subtitle">Mô tả và giá sản phẩm của bạn</p>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Mô tả sản phẩm & Tình trạng
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ví dụ: Xe đẩy em bé cao cấp với khung nhôm nhẹ, ghế có thể xoay 360°, phù hợp cho bé từ 0-3 tuổi..."
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                rows={4}
                required
              />
              {errors.description && <div className="field-error">{errors.description}</div>}
            </div>

            <div className="price-group">
              {(formData.tradeType === 'BUY_ONLY' || formData.tradeType === 'BOTH') && (
                <div className="form-group">
                  <label className="form-label">
                    <span className="required">*</span> Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 2500000"
                    className={`form-input ${errors.price ? 'error' : ''}`}
                    min="0"
                  />
                  {errors.price && <div className="field-error">{errors.price}</div>}
                </div>
              )}

              {(formData.tradeType === 'RENT_ONLY' || formData.tradeType === 'BOTH') && (
                <div className="rent-price-group">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="required">*</span> Giá thuê (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="rentPrice"
                      value={formData.rentPrice}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 500000"
                      className={`form-input ${errors.rentPrice ? 'error' : ''}`}
                      min="0"
                    />
                    {errors.rentPrice && <div className="field-error">{errors.rentPrice}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn vị thời gian</label>
                    <select
                      name="rentUnit"
                      value={formData.rentUnit}
                      onChange={handleInputChange}
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

          {/* Giấy chứng nhận */}
          <section className="form-section">
            <h2 className="section-title">Giấy chứng nhận</h2>
            <p className="section-subtitle">Tải lên các giấy tờ chứng nhận liên quan đến sản phẩm của bạn</p>
            
            <div className="upload-area">
              <input
                type="file"
                id="certificates"
                multiple
                accept="image/*,.pdf"
                onChange={handleCertificateUpload}
                className="upload-input"
              />
              <label htmlFor="certificates" className="upload-label">
                <Upload size={48} className="upload-icon" />
                <div className="upload-text">
                  <div>Kéo & thả tệp vào đây hoặc bấm để chọn</div>
                </div>
              </label>
            </div>
            {formData.certificates.length > 0 && (
              <div className="uploaded-files">
                <p>{formData.certificates.length} tệp đã chọn</p>
              </div>
            )}
          </section>

          {/* Địa chỉ */}
          <section className="form-section">
            <h2 className="section-title">Địa chỉ</h2>
            <p className="section-subtitle">Cho chúng tôi biết vị trí của sản phẩm</p>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Địa chỉ
              </label>
              <div className="address-input-group">
                <MapPin className="address-icon" size={20} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 123 Đường Nguyễn Văn A, Quận 1, TP.HCM"
                  className={`form-input ${errors.address ? 'error' : ''}`}
                  required
                />
              </div>
              {errors.address && <div className="field-error">{errors.address}</div>}
            </div>
          </section>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Hoàn tất'}
            </button>
          </div>
        </form>
      </main>

      <nav className="bottom-nav">
        <a href="/revenue" className="nav-item">
          <span className="nav-icon">💰</span>
          <span className="nav-text">Doanh thu</span>
        </a>
        <a href="/products" className="nav-item">
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Đang bán</span>
        </a>
        <a href="/add" className="nav-item active">
          <span className="nav-icon">➕</span>
          <span className="nav-text">Thêm mới</span>
        </a>
      </nav>
    </>
  );

  return (
    <Layout>
      <div className="add-product-page">
        {content}
      </div>
    </Layout>
  );
};

export default AddProductPage;