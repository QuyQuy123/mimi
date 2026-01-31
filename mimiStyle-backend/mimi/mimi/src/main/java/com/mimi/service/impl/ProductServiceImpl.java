package com.mimi.service.impl;

import com.mimi.domain.Category;
import com.mimi.domain.Product;
import com.mimi.domain.User;
import com.mimi.repository.CategoryRepository;
import com.mimi.repository.ProductRepository;
import com.mimi.repository.UserRepository;
import com.mimi.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getProductsByUserId(Long userId) {
        return productRepository.findBySellerId(userId);
    }

    @Override
    public Product saveProduct(Product product) {
        // Nếu request gửi seller.id thì dùng user đó làm người bán; nếu không mới dùng user đầu tiên (mặc định)
        if (product.getSeller() != null && product.getSeller().getId() != null) {
            User seller = userRepository.findById(product.getSeller().getId())
                .orElseThrow(() -> new RuntimeException("Người bán không tồn tại"));
            product.setSeller(seller);
        } else if (product.getSeller() == null) {
            User defaultSeller = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng trong hệ thống"));
            product.setSeller(defaultSeller);
        }
        
        // Set default category (first category) if not provided
        if (product.getCategory() == null) {
            Category defaultCategory = categoryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục trong hệ thống"));
            product.setCategory(defaultCategory);
        }
        
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBuyPrice(product.getBuyPrice());
        existingProduct.setRentPrice(product.getRentPrice());
        existingProduct.setRentUnit(product.getRentUnit());
        existingProduct.setStatus(product.getStatus());
        existingProduct.setTradeType(product.getTradeType());
        
        return productRepository.save(existingProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}