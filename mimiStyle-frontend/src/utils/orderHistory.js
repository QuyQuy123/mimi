/**
 * Lưu / lấy lịch sử đơn hàng theo user (localStorage).
 */

const STORAGE_PREFIX = 'mimi_orders';

function getStorageKey(userId) {
  return userId ? `${STORAGE_PREFIX}_${userId}` : null;
}

/**
 * Lấy danh sách đơn hàng của user (mới nhất trước).
 * @param {string|number} userId
 * @returns {Array}
 */
export function getOrderHistory(userId) {
  const key = getStorageKey(userId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? [...list].reverse() : [];
  } catch {
    return [];
  }
}

function getRawOrders(userId) {
  const key = getStorageKey(userId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Thêm một đơn hàng vào lịch sử.
 * @param {string|number} userId
 * @param {object} order - { id, createdAt, items, form, shippingFee, paymentId, subtotal, discount, total, status }
 */
export function addOrder(userId, order) {
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    const list = getRawOrders(userId);
    list.push({
      ...order,
      id: order.id ?? `order_${Date.now()}`,
      createdAt: order.createdAt ?? new Date().toISOString(),
      status: order.status ?? 'pending',
    });
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save order to history', e);
  }
}

/**
 * Cập nhật trạng thái đơn hàng (vd: hủy đơn).
 * @param {string|number} userId
 * @param {string} orderId
 * @param {string} status - 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
 */
export function updateOrderStatus(userId, orderId, status) {
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    const list = getRawOrders(userId);
    const index = list.findIndex((o) => o.id === orderId);
    if (index === -1) return;
    list[index] = { ...list[index], status };
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not update order status', e);
  }
}
