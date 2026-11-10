import { getClientDeviceId } from "./api";

export async function getDeviceId(): Promise<string> {
  return getClientDeviceId();
}
