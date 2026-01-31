package com.mimi.repository;

import com.mimi.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.product p " +
           "WHERE p.seller.id = :sellerId " +
           "AND o.status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED') " +
           "AND (:startDate IS NULL OR o.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR o.createdAt <= :endDate) " +
           "ORDER BY o.createdAt DESC")
    List<OrderItem> findSoldItemsBySeller(@Param("sellerId") Long sellerId,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    /** Lấy tất cả order items là sản phẩm của seller (không lọc ngày). */
    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.product p " +
           "WHERE p.seller.id = :sellerId " +
           "AND o.status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED') " +
           "ORDER BY o.createdAt DESC")
    List<OrderItem> findAllSoldItemsBySeller(@Param("sellerId") Long sellerId);
}