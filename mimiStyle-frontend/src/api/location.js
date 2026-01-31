/**
 * Vietnam provinces/districts/wards from https://provinces.open-api.vn/
 * API: https://provinces.open-api.vn/api/v1/
 */

const BASE = 'https://provinces.open-api.vn/api/v1';

/**
 * Lấy tất cả tỉnh/thành và quận/huyện trong một lần (depth=2).
 * Mỗi tỉnh có mảng districts, quận/huyện không kèm phường/xã (wards: null).
 * @returns {Promise<Array<{ code: number, name: string, districts: Array<{ code: number, name: string }> }>>}
 */
export async function getProvincesWithDistricts() {
  const res = await fetch(`${BASE}/?depth=2`);
  if (!res.ok) throw new Error('Không tải được danh sách tỉnh thành / quận huyện');
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((p) => ({
    code: p.code,
    name: p.name,
    districts: Array.isArray(p.districts)
      ? p.districts.map((d) => ({ code: d.code, name: d.name }))
      : [],
  }));
}

/**
 * Lấy danh sách tỉnh/thành (depth=1 để không kèm quận/huyện).
 * @returns {Promise<Array<{ code: number, name: string }>>}
 */
export async function getProvinces() {
  const res = await fetch(`${BASE}/?depth=1`);
  if (!res.ok) throw new Error('Không tải được danh sách tỉnh/thành');
  const data = await res.json();
  return Array.isArray(data) ? data.map((p) => ({ code: p.code, name: p.name })) : [];
}

/**
 * Lấy quận/huyện theo mã tỉnh (dùng khi đã có cache từ getProvincesWithDistricts).
 * Nếu cần gọi API riêng: d/?province_code=... hoặc fallback depth=2.
 * @param {number} provinceCode
 * @returns {Promise<Array<{ code: number, name: string }>>}
 */
export async function getDistricts(provinceCode) {
  if (!provinceCode) return [];
  try {
    const res = await fetch(`${BASE}/d/?province_code=${provinceCode}`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list.map((d) => ({ code: d.code, name: d.name }));
  } catch {
    try {
      const res = await fetch(`${BASE}/?depth=2`);
      if (!res.ok) return [];
      const provinces = await res.json();
      const province = Array.isArray(provinces)
        ? provinces.find((p) => p.code === provinceCode)
        : null;
      const districts = province?.districts ?? [];
      return districts.map((d) => ({ code: d.code, name: d.name }));
    } catch {
      return [];
    }
  }
}

/**
 * Lấy phường/xã theo mã quận/huyện.
 * API w/?district_code=... có thể trả về nhiều quận, nên lọc theo district_code.
 * @param {number} districtCode
 * @returns {Promise<Array<{ code: number, name: string }>>}
 */
export async function getWards(districtCode) {
  if (!districtCode) return [];
  try {
    const res = await fetch(`${BASE}/w/?district_code=${districtCode}`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list
      .filter((w) => w.district_code === districtCode)
      .map((w) => ({ code: w.code, name: w.name }));
  } catch {
    return [];
  }
}
