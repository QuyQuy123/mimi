package com.mimi.service.impl;

import com.mimi.domain.OrderItem;
import com.mimi.domain.ProductImage;
import com.mimi.dto.response.RevenueResponse;
import com.mimi.dto.response.SoldProductResponse;
import com.mimi.repository.OrderItemRepository;
import com.mimi.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService {

    private final OrderItemRepository orderItemRepository;

    @Override
    public RevenueResponse getRevenueSummary(Long userId, LocalDate startDate, LocalDate endDate, String category) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;
        
        List<OrderItem> soldItems = orderItemRepository.findSoldItemsBySeller(userId, startDateTime, endDateTime);
        
        // Filter by category if provided
        if (category != null && !category.isEmpty()) {
            soldItems = soldItems.stream()
                .filter(item -> item.getProduct().getCategory() != null && 
                               item.getProduct().getCategory().getName().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        }
        
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
    public List<SoldProductResponse> getSoldProducts(Long userId, LocalDate startDate, LocalDate endDate, String category) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;
        
        List<OrderItem> soldItems = orderItemRepository.findSoldItemsBySeller(userId, startDateTime, endDateTime);
        
        // Filter by category if provided
        if (category != null && !category.isEmpty()) {
            soldItems = soldItems.stream()
                .filter(item -> item.getProduct().getCategory() != null && 
                               item.getProduct().getCategory().getName().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        }
        
        return soldItems.stream()
            .map(this::mapToSoldProductResponse)
            .collect(Collectors.toList());
    }
    
    private SoldProductResponse mapToSoldProductResponse(OrderItem orderItem) {
        String imageUrl = orderItem.getProduct().getImages() != null && !orderItem.getProduct().getImages().isEmpty()
            ? orderItem.getProduct().getImages().get(0).getImageUrl()
            : "/api/placeholder/60/60";
            
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