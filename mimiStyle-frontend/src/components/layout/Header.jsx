import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, Package, Settings, LogOut, ChevronRight, Minus, Plus, History } from 'lucide-react';
import '../../styles/Header.css';
import { API_ORIGIN } from '../../api/config';
import { useCart } from '../../context/CartContext';

const SHIPPING_FEE = 30000;

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const cartPanelRef = useRef(null);
  const { items, getCartCount, updateQuantity, removeFromCart, isCartOpen, toggleCart, closeCart } = useCart();

  useEffect(() => {
    const syncUserFromSession = () => {
      const savedUser = sessionStorage.getItem('user');
      if (!savedUser) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    };

    syncUserFromSession();

    // Same-tab updates: ProfilePage dispatches this event after saving user into sessionStorage
    const onUserUpdated = () => syncUserFromSession();
    window.addEventListener('mimi:user-updated', onUserUpdated);

    // Cross-tab updates (if any)
    const onStorage = (evt) => {
      if (evt.key === 'user') syncUserFromSession();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('mimi:user-updated', onUserUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (cartPanelRef.current && !cartPanelRef.current.contains(event.target)) {
        closeCart();
      }
    };

    if (showDropdown || isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, isCartOpen, closeCart]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    window.dispatchEvent(new CustomEvent('mimi:user-updated'));
    navigate('/login', { replace: true });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-logo">
          <span className="app-logo-icon">✨</span>
          <span className="app-logo-text">MiMi</span>
        </div>
        <nav className="app-nav-menu">
          <button className="app-nav-link" type="button" onClick={() => navigate('/home')}>
            Trang Chủ
          </button>
          <button className="app-nav-link" type="button" onClick={() => navigate('/products')}>
            Sản Phẩm Bán
          </button>
          <button className="app-nav-link" type="button">
            Sản Phẩm Thuê
          </button>
          <button className="app-nav-link" type="button">
            Giới Thiệu
          </button>
          <button className="app-nav-link" type="button">
            Liên Hệ
          </button>
        </nav>
        <div className="app-header-right">
          {user && (
            <div className="app-cart-wrapper" ref={cartPanelRef}>
              <button
                type="button"
                className="app-cart-icon-btn"
                onClick={toggleCart}
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="app-cart-icon" size={22} />
                {getCartCount() > 0 && (
                  <span className="app-cart-badge">{getCartCount()}</span>
                )}
              </button>
              {isCartOpen && (
                <div className="app-cart-panel">
                  <div className="app-cart-panel-title">Giỏ hàng của bạn</div>
                  <div className="app-cart-list">
                    {items.length === 0 ? (
                      <div className="app-cart-empty">Chưa có sản phẩm trong giỏ</div>
                    ) : (
                      items.map((item) => {
                        const imgSrc = item.product?.imageSrc || 'https://via.placeholder.com/80x80/f0f0f0/666?text=SP';
                        const variantText = [item.colorLabel, item.sizeLabel].filter(Boolean).join(' / ') || '';
                        return (
                          <div key={`${item.productId}-${item.colorIndex}-${item.sizeIndex}`} className="app-cart-item">
                            <img className="app-cart-item-img" src={imgSrc} alt={item.product?.name} />
                            <div className="app-cart-item-body">
                              <div className="app-cart-item-name">{item.product?.name}</div>
                              {variantText && <div className="app-cart-item-variant">{variantText}</div>}
                              <div className="app-cart-item-row">
                                <div className="app-cart-qty">
                                  <button type="button" onClick={() => updateQuantity(item.productId, item.colorIndex, item.sizeIndex, -1)}><Minus size={14} /></button>
                                  <span>{item.quantity}</span>
                                  <button type="button" onClick={() => updateQuantity(item.productId, item.colorIndex, item.sizeIndex, 1)}><Plus size={14} /></button>
                                </div>
                                <button type="button" className="app-cart-remove" onClick={() => removeFromCart(item.productId, item.colorIndex, item.sizeIndex)}>Xóa</button>
                              </div>
                              <div className="app-cart-item-price">{formatPrice((item.product?.price ?? 0) * item.quantity)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {items.length > 0 && (
                    <>
                      <div className="app-cart-summary">
                        <div className="app-cart-summary-row">
                          <span>Tổng phụ</span>
                          <span>{formatPrice(items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0))}</span>
                        </div>
                        <div className="app-cart-summary-row">
                          <span>Phí vận chuyển</span>
                          <span>{formatPrice(SHIPPING_FEE)}</span>
                        </div>
                        <div className="app-cart-summary-row app-cart-total">
                          <span>Tổng cộng</span>
                          <span>{formatPrice(items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0) + SHIPPING_FEE)}</span>
                        </div>
                      </div>
                      <button type="button" className="app-cart-checkout-btn" onClick={() => { closeCart(); navigate('/checkout'); }}>
                        Thanh toán
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="app-user-profile-wrapper" ref={dropdownRef}>
          <div className="app-user-profile" onClick={toggleDropdown}>
            <div className="app-user-avatar">
              {user?.avatarUrl ? (
                <img
                  className="app-user-avatar-img"
                  src={`${API_ORIGIN}/uploads/avatars/${user.avatarUrl}`}
                  alt="Avatar"
                />
              ) : (
                (user?.fullName?.charAt(0)?.toUpperCase() || 'U')
              )}
            </div>
            <span className="app-user-name">{user?.fullName || 'Người dùng'}</span>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="app-user-dropdown">
              <div className="app-dropdown-header">
                <div className="app-dropdown-avatar">
                  {user?.avatarUrl ? (
                    <img
                      className="app-user-avatar-img"
                      src={`${API_ORIGIN}/uploads/avatars/${user.avatarUrl}`}
                      alt="Avatar"
                    />
                  ) : (
                    (user?.fullName?.charAt(0)?.toUpperCase() || 'U')
                  )}
                </div>
                <span className="app-dropdown-name">{user?.fullName || 'Người dùng'}</span>
              </div>
              <div className="app-dropdown-divider"></div>
              <div className="app-dropdown-menu">
                <button
                  className="app-dropdown-item"
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  <Users className="app-dropdown-icon" size={20} />
                  <span>Xem tất cả trang cá nhân</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button
                  className="app-dropdown-item"
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/order-history');
                  }}
                >
                  <History className="app-dropdown-icon" size={20} />
                  <span>Lịch sử mua hàng</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button 
                  className="app-dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    toggleCart();
                  }}
                >
                  <ShoppingCart className="app-dropdown-icon" size={20} />
                  <span>Xem giỏ hàng</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button 
                  className="app-dropdown-item"
                  onClick={() => {
                    navigate('/products');
                    setShowDropdown(false);
                  }}
                >
                  <Package className="app-dropdown-icon" size={20} />
                  <span>Sản phẩm đăng bán</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button 
                  className="app-dropdown-item"
                  onClick={() => {
                    // TODO: Navigate to settings page
                    setShowDropdown(false);
                  }}
                >
                  <Settings className="app-dropdown-icon" size={20} />
                  <span>Cài đặt</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button className="app-dropdown-item" onClick={handleLogout}>
                  <LogOut className="app-dropdown-icon" size={20} />
                  <span>Đăng Xuất</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
