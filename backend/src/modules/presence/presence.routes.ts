import { Request, Response, Router } from 'express';
import { PRESENCE_CONFIG, PresenceControlConfig } from './presence.config';

const r = Router();

export interface ActiveDeviceSession {
  key: string;
  device_id: string;
  tab_id: string;
  platform: string;
  lang: string;
  ip: string;
  connected_at: string;
  last_seen: number;
  has_sse: boolean;
}

// Danh sách thiết bị đang truy cập thực tế trong bộ nhớ thời gian thực
const activeSessions = new Map<string, ActiveDeviceSession>();

// Danh sách kết nối SSE đang lắng nghe để cập nhật giao diện Admin tức thì
const sseListeners = new Set<Response>();

// Cấu hình điều khiển hiện hành (khởi tạo từ file presence.config.ts)
const runtimeConfig: PresenceControlConfig = { ...PRESENCE_CONFIG };

function detectPlatform(req: Request, provided?: string): string {
  if (provided && provided.trim()) return provided.trim();
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('edg/')) return 'Web (Edge)';
  if (ua.includes('chrome/')) return 'Web (Chrome)';
  if (ua.includes('safari/')) return 'Web (Safari)';
  if (ua.includes('firefox/')) return 'Web (Firefox)';
  return 'Web';
}

function getSessionKey(deviceId: string, tabId?: string): string {
  const cleanDevice = (deviceId || 'anon').trim();
  const cleanTab = (tabId || cleanDevice).trim();
  return runtimeConfig.COUNT_EACH_TAB_AS_DEVICE ? `${cleanDevice}::${cleanTab}` : cleanDevice;
}

function pruneExpiredSessions(): boolean {
  const now = Date.now();
  let changed = false;
  for (const [key, session] of activeSessions.entries()) {
    // Nếu không có kết nối SSE trực tiếp và quá thời gian timeout -> xoá thiết bị
    if (!session.has_sse && now - session.last_seen > runtimeConfig.HEARTBEAT_TIMEOUT_MS) {
      activeSessions.delete(key);
      changed = true;
    }
  }
  return changed;
}

export function computeOnlineCount(realCount: number): number {
  if (runtimeConfig.FIXED_ONLINE_COUNT !== null && runtimeConfig.FIXED_ONLINE_COUNT !== undefined) {
    return Math.max(0, Math.round(runtimeConfig.FIXED_ONLINE_COUNT));
  }
  let calculated = realCount + (runtimeConfig.OFFSET_ONLINE_COUNT || 0);
  if (calculated < runtimeConfig.MIN_ONLINE_COUNT) {
    calculated = runtimeConfig.MIN_ONLINE_COUNT;
  }
  if (runtimeConfig.MAX_ONLINE_COUNT !== null && calculated > runtimeConfig.MAX_ONLINE_COUNT) {
    calculated = runtimeConfig.MAX_ONLINE_COUNT;
  }
  return Math.max(0, calculated);
}

export function getPresenceSummary() {
  pruneExpiredSessions();
  const devices = Array.from(activeSessions.values()).map((s) => ({
    key: s.key,
    device_id: s.device_id,
    tab_id: s.tab_id,
    platform: s.platform,
    lang: s.lang,
    ip: s.ip,
    connected_at: s.connected_at,
    seconds_ago: Math.max(0, Math.round((Date.now() - s.last_seen) / 1000)),
  }));
  const real_online = devices.length;
  const online_count = computeOnlineCount(real_online);

  return {
    online_count,
    real_online,
    config: { ...runtimeConfig },
    config_file: 'backend/src/modules/presence/presence.config.ts',
    devices,
  };
}

function broadcastPresence(extra?: Record<string, unknown>) {
  if (sseListeners.size === 0) return;
  const payload = `data: ${JSON.stringify({ ...getPresenceSummary(), ...(extra || {}) })}\n\n`;
  for (const res of sseListeners) {
    try {
      res.write(payload);
    } catch {
      sseListeners.delete(res);
    }
  }
}

export function broadcastAdminRefresh() {
  broadcastPresence({ stats_updated: true });
}

// Quét định kỳ mỗi 3 giây để dọn thiết bị mất kết nối đột ngột
setInterval(() => {
  if (pruneExpiredSessions()) {
    broadcastPresence();
  }
}, 3000).unref();

// 1. Lấy trạng thái số lượng thiết bị đang truy cập hiện tại
r.get('/', (_req, res) => {
  res.json(getPresenceSummary());
});

// 2. Kết nối thời gian thực (SSE):
// - Nếu role=client (Frontend mở trang): Tăng số lượng ngay lập tức; khi đóng tab/cửa sổ -> giảm ngay lập tức!
// - Nếu role=admin (Trang quản trị): Nhận dữ liệu cập nhật trực tiếp mỗi khi có thiết bị vào/ra.
r.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const role = String(req.query.role || 'client');
  let clientKey: string | null = null;

  if (role === 'client') {
    const deviceId = String(req.query.device_id || `dev_${Date.now()}`);
    const tabId = String(req.query.tab_id || `tab_${Date.now()}`);
    const lang = String(req.query.lang || 'vi');
    const platform = detectPlatform(req, typeof req.query.platform === 'string' ? req.query.platform : undefined);
    clientKey = getSessionKey(deviceId, tabId);

    const existing = activeSessions.get(clientKey);
    activeSessions.set(clientKey, {
      key: clientKey,
      device_id: deviceId,
      tab_id: tabId,
      platform,
      lang,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
      connected_at: existing?.connected_at || new Date().toISOString(),
      last_seen: Date.now(),
      has_sse: true,
    });
  }

  sseListeners.add(res);
  // Gửi ngay trạng thái mới nhất cho mọi listener (bao gồm cả Admin)
  broadcastPresence();

  const keepAliveTimer = setInterval(() => {
    if (clientKey && activeSessions.has(clientKey)) {
      const s = activeSessions.get(clientKey)!;
      s.last_seen = Date.now();
    }
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(keepAliveTimer);
    }
  }, 10000);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
    sseListeners.delete(res);
    if (clientKey && activeSessions.has(clientKey)) {
      activeSessions.delete(clientKey);
      broadcastPresence();
    }
  });
});

// 3. Nhịp tim (Heartbeat) từ thiết bị Frontend (cập nhật ngôn ngữ đang xem hoặc giữ kết nối trên Mobile)
r.post('/heartbeat', (req, res) => {
  const body = req.body || {};
  const deviceId = String(body.device_id || '').trim();
  if (!deviceId) {
    return res.status(400).json({ code: 'MISSING_DEVICE_ID', message: 'Thiếu device_id' });
  }
  const tabId = String(body.tab_id || deviceId).trim();
  const lang = String(body.lang || 'vi').trim();
  const platform = detectPlatform(req, body.platform);
  const key = getSessionKey(deviceId, tabId);

  const existing = activeSessions.get(key);
  activeSessions.set(key, {
    key,
    device_id: deviceId,
    tab_id: tabId,
    platform,
    lang,
    ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
    connected_at: existing?.connected_at || new Date().toISOString(),
    last_seen: Date.now(),
    has_sse: existing?.has_sse ?? false,
  });

  broadcastPresence();
  return res.json(getPresenceSummary());
});

// 4. Ngắt kết nối tức thì khi người dùng đóng tab / thoát ứng dụng (sendBeacon / fetch keepalive)
r.post('/leave', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const deviceId = String(body?.device_id || req.query.device_id || '').trim();
  const tabId = String(body?.tab_id || req.query.tab_id || '').trim();

  if (deviceId) {
    const key = getSessionKey(deviceId, tabId || deviceId);
    activeSessions.delete(key);
    // Nếu không truyền tab_id, xoá mọi phiên thuộc device_id đó
    if (!tabId) {
      for (const k of activeSessions.keys()) {
        if (k.startsWith(`${deviceId}::`)) {
          activeSessions.delete(k);
        }
      }
    }
    broadcastPresence();
  }
  return res.status(204).end();
});

// 5. Điều khiển (Control) số liệu hiển thị trực tiếp từ Admin hoặc API
r.post('/control', (req, res) => {
  const b = req.body || {};

  if ('fixed_online_count' in b) {
    runtimeConfig.FIXED_ONLINE_COUNT =
      b.fixed_online_count === null || b.fixed_online_count === ''
        ? null
        : Math.max(0, Number(b.fixed_online_count));
  }
  if ('offset_online_count' in b) {
    runtimeConfig.OFFSET_ONLINE_COUNT = Number(b.offset_online_count) || 0;
  }
  if ('min_online_count' in b) {
    runtimeConfig.MIN_ONLINE_COUNT = Math.max(0, Number(b.min_online_count) || 0);
  }
  if ('count_each_tab_as_device' in b) {
    runtimeConfig.COUNT_EACH_TAB_AS_DEVICE = Boolean(b.count_each_tab_as_device);
  }
  if (b.reset === true) {
    Object.assign(runtimeConfig, PRESENCE_CONFIG);
  }

  broadcastPresence();
  return res.json(getPresenceSummary());
});

export default r;
