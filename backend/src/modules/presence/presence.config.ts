/**
 * ============================================================================
 * BẢNG ĐIỀU KHIỂN SỐ LƯỢNG THIẾT BỊ TRUY CẬP (ONLINE PRESENCE CONFIG)
 * File: backend/src/modules/presence/presence.config.ts
 * ============================================================================
 * Bạn có thể chỉnh trực tiếp các thông số dưới đây để kiểm soát (control)
 * số lượng thiết bị đang truy cập hiển thị trên trang Quản trị (Backend Admin)
 * và API `/api/presence` / `/api/stats`.
 */

export interface PresenceControlConfig {
  /**
   * 1. KHOÁ CỨNG SỐ LƯỢNG HIỂN THỊ (FIXED_ONLINE_COUNT)
   * - Để `null`: Hệ thống tự động đếm thực tế theo thời gian thực
   *   (mở web/app là tăng, thoát tab/app là giảm ngay lập tức).
   * - Đặt một số nguyên (ví dụ: `15`): Luôn hiển thị cố định 15 thiết bị
   *   bất kể có bao nhiêu thiết bị thật đang mở.
   */
  FIXED_ONLINE_COUNT: number | null;

  /**
   * 2. SỐ LƯỢNG CỘNG THÊM / BÙ TRỪ (OFFSET_ONLINE_COUNT)
   * - Công thức khi FIXED_ONLINE_COUNT = null:
   *     Số hiển thị = Số thiết bị thật đang mở + OFFSET_ONLINE_COUNT
   * - Mặc định: `0` (hiển thị đúng 100% số thiết bị thật: mở 1 thiết bị = 1, thoát hết = 0).
   * - Ví dụ: Đặt `5` thì khi có 1 thiết bị thật mở lên sẽ hiển thị `6`, khi thoát ra giảm về `5`.
   */
  OFFSET_ONLINE_COUNT: number;

  /**
   * 3. GIỚI HẠN TỐI THIỂU & TỐI ĐA (MIN / MAX)
   * - MIN_ONLINE_COUNT: Số lượng nhỏ nhất hiển thị (mặc định `0`).
   * - MAX_ONLINE_COUNT: Số lượng lớn nhất hiển thị (`null` = không giới hạn).
   */
  MIN_ONLINE_COUNT: number;
  MAX_ONLINE_COUNT: number | null;

  /**
   * 4. CHẾ ĐỘ ĐẾM THIẾT BỊ (COUNT_EACH_TAB_AS_DEVICE)
   * - `true` (Khuyên dùng khi test/demo): Mỗi tab trình duyệt hoặc mỗi điện thoại mở
   *   Frontend được tính là 1 thiết bị riêng (bạn mở 3 tab sẽ thấy báo 3 thiết bị,
   *   đóng 1 tab giảm ngay xuống 2).
   * - `false`: Gộp chung các tab trên cùng 1 trình duyệt thành 1 thiết bị duy nhất.
   */
  COUNT_EACH_TAB_AS_DEVICE: boolean;

  /**
   * 5. THỜI GIAN TIMEOUT KHI MẤT KẾT NỐI ĐỘT NGỘT (HEARTBEAT_TIMEOUT_MS)
   * - Thông thường khi đóng tab/app, tín hiệu ngắt kết nối (SSE close / sendBeacon)
   *   sẽ làm giảm số lượng NGAY LẬP TỨC (< 1 giây).
   * - Nếu thiết bị sập nguồn hoặc rớt mạng đột ngột, sau `12000` ms (12 giây)
   *   không có nhịp tim (heartbeat), hệ thống sẽ tự động xoá thiết bị đó.
   */
  HEARTBEAT_TIMEOUT_MS: number;
}

export const PRESENCE_CONFIG: PresenceControlConfig = {
  FIXED_ONLINE_COUNT: null,      // Để null để tự động tăng/giảm thực tế; hoặc điền số (VD: 10) để cố định
  OFFSET_ONLINE_COUNT: 0,        // Cộng thêm bao nhiêu thiết bị ảo vào số thực tế (Mặc định: 0)
  MIN_ONLINE_COUNT: 0,           // Số lượng tối thiểu khi không có ai truy cập (Mặc định: 0)
  MAX_ONLINE_COUNT: null,        // Số lượng tối đa (null = không giới hạn)
  COUNT_EACH_TAB_AS_DEVICE: true, // true = mỗi tab/cửa sổ mở lên tính là 1 thiết bị truy cập
  HEARTBEAT_TIMEOUT_MS: 12000,   // 12 giây timeout nếu thiết bị mất mạng đột ngột
};
