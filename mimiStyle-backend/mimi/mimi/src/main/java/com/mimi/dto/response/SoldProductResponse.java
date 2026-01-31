package com.mimi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoldProductResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal totalAmount;
    private LocalDate soldDate;
    private String category;
    private Long orderId;
    private String orderStatus;
}