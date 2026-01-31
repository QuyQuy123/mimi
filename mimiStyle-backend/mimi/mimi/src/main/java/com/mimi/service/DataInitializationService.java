package com.mimi.service;

import com.mimi.domain.Category;
import com.mimi.domain.Product;
import com.mimi.domain.User;
import com.mimi.domain.Voucher;
import com.mimi.domain.ProductImage;
import com.mimi.domain.enums.ProductStatus;
import com.mimi.domain.enums.RentUnit;
import com.mimi.domain.enums.Role;
import com.mimi.domain.enums.TradeType;
import com.mimi.repository.CategoryRepository;
import com.mimi.repository.ProductRepository;
import com.mimi.repository.UserRepository;
import com.mimi.repository.VoucherRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataInitializationService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final VoucherRepository voucherRepository;

    @PostConstruct
    public void initializeData() {
        // Create default user if not exists
        if (userRepository.count() == 0) {
            User defaultUser = new User();
            defaultUser.setUsername("admin");
            defaultUser.setFullName("Admin User");
            defaultUser.setEmail("admin@mimi.com");
            defaultUser.setPassword("$2a$10$dummy.hash.for.demo"); // Dummy hash
            defaultUser.setRole(Role.ADMIN);
            userRepository.save(defaultUser);
        }

        // Create default categories if not exist
        if (categoryRepository.count() == 0) {
            String[] categoryNames = {
                "Đồ chơi", "Quần áo", "Giày dép", "Xe đẩy", 
                "Bình sữa", "Tã bỉm", "Sữa bột", "Nôi cũi",
                "Ghế ăn dặm", "Đồ dùng tắm"
            };

            for (String name : categoryNames) {
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
            }
        }

        // Create sample products if not exist
        if (productRepository.count() == 0) {
            User defaultUser = userRepository.findAll().get(0);
            Category toyCategory = categoryRepository.findByName("Đồ chơi").orElse(categoryRepository.findAll().get(0));
            Category strollerCategory = categoryRepository.findByName("Xe đẩy").orElse(categoryRepository.findAll().get(0));
            Category chairCategory = categoryRepository.findByName("Ghế ăn dặm").orElse(categoryRepository.findAll().get(0));
            Category cribCategory = categoryRepository.findByName("Nôi cũi").orElse(categoryRepository.findAll().get(0));

            // Featured products
            Product product1 = new Product();
            product1.setName("Máy tiệt trùng bình sữa UV");
            product1.setDescription("Máy tiệt trùng hiện đại với công nghệ UV, an toàn cho bé");
            product1.setBuyPrice(new BigDecimal("1500000"));
            product1.setRentPrice(new BigDecimal("150000"));
            product1.setRentUnit(RentUnit.MONTH);
            product1.setTradeType(TradeType.BOTH);
            product1.setConditionPercentage(95);
            product1.setStatus(ProductStatus.ACTIVE);
            product1.setAddressContact("123 Nguyễn Văn Cừ, Q.5, TP.HCM");
            product1.setFeatured(true);
            product1.setIsNew(true);
            product1.setSeller(defaultUser);
            product1.setCategory(toyCategory);
            // Chỉ lưu tên file (backend GET /api/products/images/{filename} dùng filename)
            List<ProductImage> images1 = new ArrayList<>();
            images1.add(new ProductImage(null, product1,
                    "may-tiet-trung-binh-sua-co-say-kho-bang-tia-uv-spectra-1.jpg",
                    true));
            product1.setImages(images1);
            productRepository.save(product1);

            Product product2 = new Product();
            product2.setName("Máy hút sữa điện tử thông minh");
            product2.setDescription("Máy hút sữa với nhiều chế độ massage tự nhiên");
            product2.setBuyPrice(new BigDecimal("2000000"));
            product2.setRentPrice(new BigDecimal("200000"));
            product2.setRentUnit(RentUnit.MONTH);
            product2.setTradeType(TradeType.BOTH);
            product2.setConditionPercentage(98);
            product2.setStatus(ProductStatus.ACTIVE);
            product2.setAddressContact("456 Lê Văn Sỹ, Q.3, TP.HCM");
            product2.setFeatured(true);
            product2.setIsNew(false);
            product2.setSeller(defaultUser);
            product2.setCategory(toyCategory);
            List<ProductImage> images2 = new ArrayList<>();
            images2.add(new ProductImage(null, product2,
                    "May-hut-sua-dien-doi-Resonance-3-Fb1160VN-3.jpeg",
                    true));
            product2.setImages(images2);
            productRepository.save(product2);

            Product product3 = new Product();
            product3.setName("Nôi em bé thông minh");
            product3.setDescription("Nôi có chức năng ru tự động và phát nhạc");
            product3.setBuyPrice(new BigDecimal("5000000"));
            product3.setRentPrice(new BigDecimal("500000"));
            product3.setRentUnit(RentUnit.MONTH);
            product3.setTradeType(TradeType.BOTH);
            product3.setConditionPercentage(92);
            product3.setStatus(ProductStatus.ACTIVE);
            product3.setAddressContact("789 Võ Văn Tần, Q.3, TP.HCM");
            product3.setFeatured(true);
            product3.setIsNew(false);
            product3.setSeller(defaultUser);
            product3.setCategory(cribCategory);
            List<ProductImage> images3 = new ArrayList<>();
            images3.add(new ProductImage(null, product3,
                    "top-5-thuong-hieu-noi-cho-be-duoc-ua-chuong-nhat-hien-nay-2020-1595675197.png",
                    true));
            product3.setImages(images3);
            productRepository.save(product3);

            // New products
            Product product4 = new Product();
            product4.setName("Xe đẩy em bé cao cấp");
            product4.setDescription("Xe đẩy nhẹ, gấp gọn, phù hợp cho trẻ từ 0-3 tuổi");
            product4.setBuyPrice(new BigDecimal("3000000"));
            product4.setRentPrice(new BigDecimal("300000"));
            product4.setRentUnit(RentUnit.MONTH);
            product4.setTradeType(TradeType.BOTH);
            product4.setConditionPercentage(90);
            product4.setStatus(ProductStatus.ACTIVE);
            product4.setAddressContact("321 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM");
            product4.setFeatured(false);
            product4.setIsNew(true);
            product4.setSeller(defaultUser);
            product4.setCategory(strollerCategory);
            List<ProductImage> images4 = new ArrayList<>();
            images4.add(new ProductImage(null, product4,
                    "xe-day-tre-em-joie-versatrax-lagoon.jpg",
                    true));
            product4.setImages(images4);
            productRepository.save(product4);

            Product product5 = new Product();
            product5.setName("Ghế ăn dặm cho bé");
            product5.setDescription("Ghế ăn dặm an toàn, có thể điều chỉnh độ cao");
            product5.setBuyPrice(new BigDecimal("800000"));
            product5.setRentPrice(new BigDecimal("80000"));
            product5.setRentUnit(RentUnit.MONTH);
            product5.setTradeType(TradeType.BOTH);
            product5.setConditionPercentage(85);
            product5.setStatus(ProductStatus.ACTIVE);
            product5.setAddressContact("654 Cách Mạng Tháng 8, Q.10, TP.HCM");
            product5.setFeatured(false);
            product5.setIsNew(true);
            product5.setSeller(defaultUser);
            product5.setCategory(chairCategory);
            List<ProductImage> images5 = new ArrayList<>();
            images5.add(new ProductImage(null, product5,
                    "ghe-an-dam-umoo-1606186868.jpg",
                    true));
            product5.setImages(images5);
            productRepository.save(product5);

            Product product6 = new Product();
            product6.setName("Bộ đồ chơi giáo dục");
            product6.setDescription("Bộ đồ chơi phát triển trí tuệ cho trẻ 1-3 tuổi");
            product6.setBuyPrice(new BigDecimal("600000"));
            product6.setRentPrice(new BigDecimal("60000"));
            product6.setRentUnit(RentUnit.MONTH);
            product6.setTradeType(TradeType.BOTH);
            product6.setConditionPercentage(88);
            product6.setStatus(ProductStatus.ACTIVE);
            product6.setAddressContact("987 Nguyễn Thị Minh Khai, Q.1, TP.HCM");
            product6.setFeatured(false);
            product6.setIsNew(true);
            product6.setSeller(defaultUser);
            product6.setCategory(toyCategory);
            List<ProductImage> images6 = new ArrayList<>();
            images6.add(new ProductImage(null, product6,
                    "z6021933351086_28eb8d7e91cc13e47c6e338d1bea00f3.jpg",
                    true));
            product6.setImages(images6);
            productRepository.save(product6);
        }

        // Sample vouchers
        if (voucherRepository.count() == 0) {
            Voucher v1 = new Voucher();
            v1.setCode("GIAM50K");
            v1.setDiscountValue(new BigDecimal("50000"));
            v1.setMinOrderValue(new BigDecimal("200000"));
            v1.setExpirationDate(LocalDateTime.now().plusMonths(3));
            voucherRepository.save(v1);

            Voucher v2 = new Voucher();
            v2.setCode("FREESHIP");
            v2.setDiscountValue(new BigDecimal("30000"));
            v2.setMinOrderValue(new BigDecimal("300000"));
            v2.setExpirationDate(LocalDateTime.now().plusMonths(1));
            voucherRepository.save(v2);

            Voucher v3 = new Voucher();
            v3.setCode("TET2025");
            v3.setDiscountValue(new BigDecimal("100000"));
            v3.setMinOrderValue(new BigDecimal("500000"));
            v3.setExpirationDate(LocalDateTime.now().plusMonths(6));
            voucherRepository.save(v3);
        }
    }
}