package com.mimi.service;

import com.mimi.domain.Order;
import com.mimi.dto.request.CreateOrderRequest;
import com.mimi.dto.request.UpdateOrderStatusRequest;
import com.mimi.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    Order createOrder(CreateOrderRequest request);
    Order updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
    List<Order> getOrdersByBuyer(Long buyerId);
    List<OrderResponse> getOrderResponsesByBuyer(Long buyerId);
}
