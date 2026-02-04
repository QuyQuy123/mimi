import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Calendar, Shield, Truck, Sparkles, Users, Leaf } from 'lucide-react';
import Layout from '../components/layout/Layout';
import '../styles/AboutPage.css';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="about-page">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-inner">
            <span className="about-hero-badge">Về chúng tôi</span>
            <h1 className="about-hero-title">
              MiMi — Chăm Sóc Toàn Diện Cho Bé Yêu
            </h1>
            <p className="about-hero-lead">
              Nền tảng mua sắm và thuê đồ dùng cho trẻ em uy tín, giúp gia đình bạn tiết kiệm chi phí mà vẫn đảm bảo chất lượng và an toàn cho bé.
            </p>
          </div>
        </section>

        {/* Giới thiệu ngắn */}
        <section className="about-intro">
          <div className="about-container">
            <div className="about-intro-content">
              <h2 className="about-section-title">MiMi là gì?</h2>
              <p className="about-text">
                <strong>MiMi</strong> là website thương mại điện tử chuyên về sản phẩm cho mẹ và bé. Chúng tôi kết nối người mua và người bán, đồng thời cung cấp dịch vụ <strong>thuê đồ dùng trẻ em</strong> theo ngày, tuần hoặc tháng — phù hợp với nhu cầu sử dụng ngắn hạn mà không cần mua mới.
              </p>
              <p className="about-text">
                Từ máy tiệt trùng bình sữa, máy hút sữa, xe đẩy, nôi, ghế ăn dặm đến đồ chơi giáo dục — MiMi mang đến hàng ngàn sản phẩm chất lượng, giúp bố mẹ dễ dàng tìm kiếm, so sánh và lựa chọn giải pháp tốt nhất cho con.
              </p>
            </div>
          </div>
        </section>

        {/* Sứ mệnh & Tầm nhìn */}
        <section className="about-mission">
          <div className="about-container">
            <h2 className="about-section-title about-section-title--light">Sứ mệnh & Tầm nhìn</h2>
            <div className="about-mission-grid">
              <div className="about-mission-card">
                <div className="about-mission-icon">
                  <Heart size={32} />
                </div>
                <h3>Sứ mệnh</h3>
                <p>
                  Mang đến trải nghiệm mua sắm và thuê đồ dùng cho bé an toàn, tiện lợi và tiết kiệm, góp phần chăm sóc sức khỏe và sự phát triển toàn diện của trẻ em Việt Nam.
                </p>
              </div>
              <div className="about-mission-card">
                <div className="about-mission-icon">
                  <Sparkles size={32} />
                </div>
                <h3>Tầm nhìn</h3>
                <p>
                  Trở thành nền tảng hàng đầu tại Việt Nam về mua bán và cho thuê đồ dùng trẻ em, kết nối cộng đồng bố mẹ và lan tỏa giá trị sử dụng bền vững.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tính năng chính */}
        <section className="about-features">
          <div className="about-container">
            <h2 className="about-section-title">Tính năng nổi bật</h2>
            <div className="about-features-grid">
              <div className="about-feature-card">
                <ShoppingBag className="about-feature-icon" size={28} />
                <h3>Mua sắm đa dạng</h3>
                <p>Hàng ngàn sản phẩm từ nhiều danh mục: đồ dùng ăn uống, vệ sinh, vận chuyển, đồ chơi và thiết bị chăm sóc bé.</p>
              </div>
              <div className="about-feature-card">
                <Calendar className="about-feature-icon" size={28} />
                <h3>Thuê đồ linh hoạt</h3>
                <p>Thuê theo ngày, tuần hoặc tháng với mức giá hợp lý, phù hợp nhu cầu tạm thời và tiết kiệm ngân sách gia đình.</p>
              </div>
              <div className="about-feature-card">
                <Shield className="about-feature-icon" size={28} />
                <h3>Chất lượng đảm bảo</h3>
                <p>Sản phẩm được kiểm tra và mô tả rõ ràng về tình trạng, nguồn gốc, giúp bạn yên tâm khi sử dụng.</p>
              </div>
              <div className="about-feature-card">
                <Truck className="about-feature-icon" size={28} />
                <h3>Giao hàng tận nơi</h3>
                <p>Hỗ trợ giao nhận thuận tiện, theo dõi đơn hàng và chăm sóc khách hàng sau mua.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tại sao chọn MiMi */}
        <section className="about-why">
          <div className="about-container">
            <h2 className="about-section-title">Tại sao chọn MiMi?</h2>
            <ul className="about-why-list">
              <li>
                <Leaf className="about-why-icon" size={22} />
                <span><strong>Đa dạng sản phẩm</strong> — Từ đồ dùng thiết yếu đến thiết bị cao cấp, đáp ứng mọi giai đoạn phát triển của bé.</span>
              </li>
              <li>
                <Leaf className="about-why-icon" size={22} />
                <span><strong>Giá cả hợp lý</strong> — So sánh giá, ưu đãi và lựa chọn thuê giúp gia đình tiết kiệm chi phí.</span>
              </li>
              <li>
                <Leaf className="about-why-icon" size={22} />
                <span><strong>Mua và thuê linh hoạt</strong> — Bạn có thể mua để dùng lâu dài hoặc thuê khi cần dùng ngắn hạn.</span>
              </li>
              <li>
                <Leaf className="about-why-icon" size={22} />
                <span><strong>Cộng đồng tin cậy</strong> — Người bán/cho thuê được quản lý, đánh giá và hỗ trợ bởi nền tảng.</span>
              </li>
              <li>
                <Leaf className="about-why-icon" size={22} />
                <span><strong>Bảo mật & an toàn</strong> — Thanh toán và thông tin cá nhân được bảo vệ, giao dịch minh bạch.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Giá trị cốt lõi */}
        <section className="about-values">
          <div className="about-container">
            <h2 className="about-section-title about-section-title--light">Giá trị cốt lõi</h2>
            <div className="about-values-row">
              <div className="about-value-pill">Chất lượng</div>
              <div className="about-value-pill">Tin cậy</div>
              <div className="about-value-pill">Tiết kiệm</div>
              <div className="about-value-pill">Tiện lợi</div>
              <div className="about-value-pill">Bền vững</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <div className="about-container">
            <div className="about-cta-box">
              <Users className="about-cta-icon" size={40} />
              <h2>Tham gia cộng đồng MiMi ngay hôm nay</h2>
              <p>Khám phá sản phẩm, thuê đồ dùng cho bé hoặc đăng bán/cho thuê để chia sẻ với các gia đình khác.</p>
              <div className="about-cta-buttons">
                <button type="button" className="about-cta-btn about-cta-btn--primary" onClick={() => navigate('/home')}>
                  Khám phá sản phẩm
                </button>
                <button type="button" className="about-cta-btn about-cta-btn--secondary" onClick={() => navigate('/register')}>
                  Đăng ký tài khoản
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
