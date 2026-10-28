import { getClientDeviceId } from "./api";

/**
 * Lấy mã định danh thiết bị duy nhất và đồng bộ giữa Web và Mobile
 */
export async function getDeviceId(): Promise<string> {
  return getClientDeviceId();
}
