package com.mimi.dto.response;

import com.mimi.domain.enums.ProductStatus;
import com.mimi.domain.enums.RentUnit;
import com.mimi.domain.enums.TradeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Integer conditionPercentage;
    private TradeType tradeType;
    private BigDecimal buyPrice;
    private BigDecimal rentPrice;
    private RentUnit rentUnit;
    private ProductStatus status;
    private String addressContact;
    private Boolean featured;
    private Boolean isNew;
    private LocalDateTime createdAt;
    
    // Seller info
    private Long sellerId;
    private String sellerName;
    
    // Category info
    private Long categoryId;
    private String categoryName;
    
    // Images
    private List<String> images;
}