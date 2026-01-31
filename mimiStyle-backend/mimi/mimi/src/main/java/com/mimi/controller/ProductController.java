package com.mimi.controller;

import com.mimi.domain.Product;
import com.mimi.domain.ProductImage;
import com.mimi.dto.response.ProductResponse;
import com.mimi.repository.ProductImageRepository;
import com.mimi.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImageRepository productImageRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProductResponse>> getUserProducts(@PathVariable Long userId) {
        List<Product> products = productService.getProductsByUserId(userId);
        List<ProductResponse> productResponses = products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        List<ProductResponse> productResponses = products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        ProductResponse response = mapToProductResponse(product);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            // Basic validation
            if (product.getName() == null || product.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên sản phẩm không được để trống");
            }
            
            if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mô tả sản phẩm không được để trống");
            }
            
            if (product.getAddressContact() == null || product.getAddressContact().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Địa chỉ không được để trống");
            }
            
            // Validate prices based on trade type
            if (product.getTradeType() != null) {
                switch (product.getTradeType()) {
                    case BUY_ONLY:
                        if (product.getBuyPrice() == null || product.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0) {
                            return ResponseEntity.badRequest().body("Giá bán phải lớn hơn 0");
                        }
                        break;
                    case RENT_ONLY:
                        if (product.getRentPrice() == null || product.getRentPrice().compareTo(BigDecimal.ZERO) <= 0) {
                            return ResponseEntity.badRequest().body("Giá thuê phải lớn hơn 0");
                        }
                        break;
                    case BOTH:
                        if ((product.getBuyPrice() == null || product.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0) &&
                            (product.getRentPrice() == null || product.getRentPrice().compareTo(BigDecimal.ZERO) <= 0)) {
                            return ResponseEntity.badRequest().body("Cần có ít nhất một giá (bán hoặc thuê) lớn hơn 0");
                        }
                        break;
                }
            }
            
            // Set default seller and category if not provided (temporary solution)
            // These will be handled by ProductService now
            
            Product savedProduct = productService.saveProduct(product);
            ProductResponse response = mapToProductResponse(savedProduct);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            String errorMessage = ex.getMessage();
            
            // Handle foreign key constraint errors
            if (errorMessage.contains("foreign key constraint fails")) {
                if (errorMessage.contains("seller_id")) {
                    return ResponseEntity.badRequest().body("Thông tin người bán không tồn tại trong hệ thống");
                } else if (errorMessage.contains("category_id")) {
                    return ResponseEntity.badRequest().body("Danh mục sản phẩm không tồn tại trong hệ thống");
                } else {
                    return ResponseEntity.badRequest().body("Dữ liệu tham chiếu không hợp lệ");
                }
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi server: " + errorMessage);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(id, product);
        ProductResponse response = mapToProductResponse(updatedProduct);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}/images/{filename}")
    public ResponseEntity<?> deleteProductImage(@PathVariable Long productId, @PathVariable String filename) {
        try {
            // Kiểm tra xem ảnh bị xóa có phải thumbnail không
            List<ProductImage> deletingImages = productImageRepository.findByProductIdAndImageUrl(productId, filename);
            boolean wasThumbnail = deletingImages.stream().anyMatch(img -> Boolean.TRUE.equals(img.getIsThumbnail()));
            
            // Xóa file khỏi thư mục
            String frontendImgPath = "../mimiStyle-frontend/src/assets/img-product/";
            Path imagePath = Paths.get(frontendImgPath).resolve(filename);
            
            if (Files.exists(imagePath)) {
                Files.delete(imagePath);
            }
            
            // Xóa record khỏi database
            if (!deletingImages.isEmpty()) {
                productImageRepository.deleteAll(deletingImages);
            }
            
            // Nếu ảnh bị xóa là thumbnail, set ảnh đầu tiên còn lại làm thumbnail
            if (wasThumbnail) {
                List<ProductImage> remainingImages = productImageRepository.findByProductId(productId);
                if (!remainingImages.isEmpty()) {
                    ProductImage newThumbnail = remainingImages.get(0);
                    newThumbnail.setIsThumbnail(true);
                    productImageRepository.save(newThumbnail);
                }
            }
            
            return ResponseEntity.ok().body("Đã xóa ảnh thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi xóa ảnh: " + e.getMessage());
        }
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable String filename) {
        try {
            String frontendImgPath = "../mimiStyle-frontend/src/assets/img-product/";
            Path imagePath = Paths.get(frontendImgPath).resolve(filename);
            
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] imageBytes = Files.readAllBytes(imagePath);
            
            // Determine content type based on file extension
            String contentType = "image/jpeg"; // default
            String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            switch (extension) {
                case "png":
                    contentType = "image/png";
                    break;
                case "gif":
                    contentType = "image/gif";
                    break;
                case "webp":
                    contentType = "image/webp";
                    break;
            }
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload-images")
    public ResponseEntity<?> uploadProductImages(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> savedFilenames = new ArrayList<>();
            
            // Đường dẫn đến thư mục img-product trong frontend
            String frontendImgPath = "../mimiStyle-frontend/src/assets/img-product/";
            Path uploadPath = Paths.get(frontendImgPath);
            
            // Tạo thư mục nếu chưa tồn tại
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                
                // Tạo tên file unique
                String timestamp = String.valueOf(System.currentTimeMillis());
                String random = UUID.randomUUID().toString().substring(0, 8);
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
                String filename = "product_" + timestamp + "_" + random + extension;
                
                // Lưu file vào thư mục frontend
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                savedFilenames.add(filename);
            }
            
            return ResponseEntity.ok(savedFilenames);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<?> saveProductImageNames(@PathVariable Long id, @RequestBody List<String> imageFilenames) {
        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
            }

            if (imageFilenames == null || imageFilenames.isEmpty()) {
                return ResponseEntity.badRequest().body("Image filenames are required");
            }

            List<ProductImage> savedImages = new java.util.ArrayList<>();
            boolean isFirst = true;

            for (String filename : imageFilenames) {
                if (filename == null || filename.trim().isEmpty()) {
                    continue;
                }

                ProductImage productImage = new ProductImage();
                productImage.setProduct(product);
                productImage.setImageUrl(filename); // Store just the filename, e.g., "product_1_abc123.jpg"
                productImage.setIsThumbnail(isFirst);
                savedImages.add(productImageRepository.save(productImage));

                isFirst = false;
            }

            return ResponseEntity.ok(savedImages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    
    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setConditionPercentage(product.getConditionPercentage());
        response.setTradeType(product.getTradeType());
        response.setBuyPrice(product.getBuyPrice());
        response.setRentPrice(product.getRentPrice());
        response.setRentUnit(product.getRentUnit());
        response.setStatus(product.getStatus());
        response.setAddressContact(product.getAddressContact());
        response.setFeatured(product.getFeatured());
        response.setIsNew(product.getIsNew());
        response.setCreatedAt(product.getCreatedAt());
        
        if (product.getSeller() != null) {
            response.setSellerId(product.getSeller().getId());
            response.setSellerName(product.getSeller().getFullName());
        }
        
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }

        // Map images - need to fetch them explicitly due to LAZY loading
        try {
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            if (images != null && !images.isEmpty()) {
                List<String> imageUrls = images.stream()
                        .map(ProductImage::getImageUrl)
                        .collect(Collectors.toList());
                response.setImages(imageUrls);
            }
        } catch (Exception e) {
            // If images can't be loaded, just skip them
            System.err.println("Error loading images for product " + product.getId() + ": " + e.getMessage());
        }
        
        return response;
    }
}