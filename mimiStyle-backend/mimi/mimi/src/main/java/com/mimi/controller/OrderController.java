package com.mimi.controller;

import com.mimi.domain.Order;
import com.mimi.dto.request.CreateOrderRequest;
import com.mimi.dto.request.UpdateOrderStatusRequest;
import com.mimi.dto.response.OrderResponse;
import com.mimi.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã cập nhật trạng thái đơn hàng"));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@RequestParam Long buyerId) {
        List<OrderResponse> orders = orderService.getOrderResponsesByBuyer(buyerId);
        return ResponseEntity.ok(orders);
    }
}
