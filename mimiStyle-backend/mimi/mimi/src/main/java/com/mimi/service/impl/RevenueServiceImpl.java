package com.mimi.service.impl;

import com.mimi.domain.OrderItem;
import com.mimi.domain.ProductImage;
import com.mimi.dto.response.RevenueResponse;
import com.mimi.dto.response.SoldProductResponse;
import com.mimi.repository.OrderItemRepository;
import com.mimi.repository.ProductImageRepository;
import com.mimi.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService {

    private final OrderItemRepository orderItemRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getRevenueSummary(Long userId, LocalDate startDate, LocalDate endDate, String category) {
        List<OrderItem> soldItems = getSoldItemsForSeller(userId, startDate, endDate, category);
        BigDecimal totalRevenue = soldItems.stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        Integer totalProductsSold = soldItems.stream()
            .mapToInt(OrderItem::getQuantity)
            .sum();
        String period = formatPeriod(startDate, endDate);
        return new RevenueResponse(totalRevenue, totalProductsSold, period);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SoldProductResponse> getSoldProducts(Long userId, LocalDate startDate, LocalDate endDate, String category) {
        List<OrderItem> soldItems = getSoldItemsForSeller(userId, startDate, endDate, category);
        return soldItems.stream()
            .map(this::mapToSoldProductResponse)
            .collect(Collectors.toList());
    }

    /** Lấy order items của seller: không lọc ngày khi startDate/endDate đều null (lấy tất cả đơn đã bán). */
    private List<OrderItem> getSoldItemsForSeller(Long userId, LocalDate startDate, LocalDate endDate, String category) {
        List<OrderItem> soldItems;
        if (startDate == null && endDate == null) {
            soldItems = orderItemRepository.findAllSoldItemsBySeller(userId);
        } else {
            LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
            LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;
            soldItems = orderItemRepository.findSoldItemsBySeller(userId, startDateTime, endDateTime);
        }
        if (category != null && !category.isEmpty()) {
            soldItems = soldItems.stream()
                .filter(item -> item.getProduct() != null && item.getProduct().getCategory() != null
                    && category.equalsIgnoreCase(item.getProduct().getCategory().getName()))
                .collect(Collectors.toList());
        }
        return soldItems;
    }
    
    private SoldProductResponse mapToSoldProductResponse(OrderItem orderItem) {
        String imageUrl = null;
        if (orderItem.getProduct() != null) {
            List<ProductImage> imgs = productImageRepository.findByProductId(orderItem.getProduct().getId());
            if (imgs != null && !imgs.isEmpty()) {
                imageUrl = imgs.get(0).getImageUrl();
            }
        }
        if (imageUrl == null) imageUrl = "";
            
        String categoryName = orderItem.getProduct().getCategory() != null 
            ? orderItem.getProduct().getCategory().getName()
            : "Khác";
            
        BigDecimal totalAmount = orderItem.getPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
        
        return new SoldProductResponse(
            orderItem.getProduct().getId(),
            orderItem.getProduct().getName(),
            imageUrl,
            orderItem.getQuantity(),
            totalAmount,
            orderItem.getOrder().getCreatedAt().toLocalDate(),
            categoryName,
            orderItem.getOrder().getId(),
            orderItem.getOrder().getStatus() != null ? orderItem.getOrder().getStatus().name() : "PENDING"
        );
    }
    
    private String formatPeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "Tất cả thời gian";
        }
        
        String start = startDate != null ? startDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "Bắt đầu";
        String end = endDate != null ? endDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "Hiện tại";
        
        return start + " - " + end;
    }
}