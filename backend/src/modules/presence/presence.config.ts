
export interface PresenceControlConfig {
  FIXED_ONLINE_COUNT: number | null;

  OFFSET_ONLINE_COUNT: number;

  MIN_ONLINE_COUNT: number;
  MAX_ONLINE_COUNT: number | null;

  COUNT_EACH_TAB_AS_DEVICE: boolean;

  HEARTBEAT_TIMEOUT_MS: number;
}

export const PRESENCE_CONFIG: PresenceControlConfig = {
  FIXED_ONLINE_COUNT: null,  OFFSET_ONLINE_COUNT: 0,  MIN_ONLINE_COUNT: 0,  MAX_ONLINE_COUNT: null,  COUNT_EACH_TAB_AS_DEVICE: true,  HEARTBEAT_TIMEOUT_MS: 12000,};
