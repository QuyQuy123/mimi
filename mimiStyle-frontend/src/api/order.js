const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

/**
 * Tạo đơn hàng (khi khách hoàn tất thanh toán).
 * @param {object} payload - { buyerId, shippingName, shippingPhone, shippingAddress, shippingEmail?, shippingFee, discountAmount, paymentMethod, note?, items: [{ productId, quantity, variantId? }] }
 */
export async function createOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tạo đơn hàng');
  }
  return res.json();
}

/**
 * Cập nhật trạng thái đơn hàng (vd: PENDING -> SHIPPING).
 * @param {number} orderId
 * @param {string} status - 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
 */
export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const err = text ? JSON.parse(text) : {};
      throw new Error(err.message || 'Không thể cập nhật trạng thái đơn hàng');
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error('Không thể cập nhật trạng thái đơn hàng');
      throw e;
    }
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/**
 * Lấy danh sách đơn hàng của người mua (buyer) từ backend.
 * @param {number} buyerId
 * @returns {Promise<Array>} [{ id, createdAt, status, shippingName, shippingPhone, shippingAddress, items, totalAmount, ... }]
 */
export async function getMyOrders(buyerId) {
  const res = await fetch(`${API_BASE_URL}/orders/me?buyerId=${buyerId}`);
  const text = await res.text();
  if (!res.ok) throw new Error('Không thể tải lịch sử đơn hàng');
  try {
    return text ? JSON.parse(text) : [];
  } catch (e) {
    throw new Error('Dữ liệu trả về không hợp lệ');
  }
}
