package com.mimi.service.impl;

import com.mimi.domain.Order;
import com.mimi.domain.OrderItem;
import com.mimi.domain.Product;
import com.mimi.domain.ProductImage;
import com.mimi.domain.User;
import com.mimi.domain.enums.OrderType;
import com.mimi.dto.request.CreateOrderRequest;
import com.mimi.dto.request.UpdateOrderStatusRequest;
import com.mimi.dto.response.OrderItemResponse;
import com.mimi.dto.response.OrderResponse;
import com.mimi.repository.OrderRepository;
import com.mimi.repository.ProductImageRepository;
import com.mimi.repository.ProductRepository;
import com.mimi.repository.UserRepository;
import com.mimi.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.getProductId()));
            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            BigDecimal price = product.getBuyPrice() != null ? product.getBuyPrice() : BigDecimal.ZERO;
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(qty));
            totalAmount = totalAmount.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setProduct(product);
            oi.setQuantity(qty);
            oi.setPrice(price);
            oi.setOrderType(OrderType.BUY);
            oi.setVariant(null);
            orderItems.add(oi);
        }

        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.add(shippingFee).subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        Order order = new Order();
        order.setBuyer(buyer);
        order.setTotalAmount(totalAmount);
        order.setShippingFee(shippingFee);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : com.mimi.domain.enums.PaymentMethod.COD);
        order.setShippingName(request.getShippingName() != null ? request.getShippingName() : buyer.getFullName());
        order.setShippingPhone(request.getShippingPhone() != null ? request.getShippingPhone() : buyer.getPhoneNumber());
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : "");
        order.setNote(request.getNote());
        order.setStatus(com.mimi.domain.enums.OrderStatus.PENDING);

        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
        }
        order.setOrderItems(orderItems);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrderResponsesByBuyer(Long buyerId) {
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        return orders.stream().map(this::toOrderResponse).collect(java.util.stream.Collectors.toList());
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems() == null ? List.of() :
            order.getOrderItems().stream().map(oi -> {
                String url = null;
                if (oi.getProduct() != null) {
                    List<ProductImage> imgs = productImageRepository.findByProductId(oi.getProduct().getId());
                    if (imgs != null && !imgs.isEmpty()) {
                        url = imgs.get(0).getImageUrl();
                    }
                }
                return new OrderItemResponse(
                    oi.getProduct().getId(),
                    oi.getProduct().getName(),
                    url,
                    oi.getQuantity(),
                    oi.getPrice(),
                    oi.getPrice().multiply(java.math.BigDecimal.valueOf(oi.getQuantity()))
                );
            }).collect(java.util.stream.Collectors.toList());

        return new OrderResponse(
            order.getId(),
            order.getCreatedAt(),
            order.getStatus(),
            order.getShippingName(),
            order.getShippingPhone(),
            order.getShippingAddress(),
            null,
            order.getTotalAmount(),
            order.getShippingFee(),
            order.getDiscountAmount(),
            order.getFinalAmount(),
            itemResponses
        );
    }
}
