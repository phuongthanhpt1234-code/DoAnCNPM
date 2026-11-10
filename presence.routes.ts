import { Request, Response, Router } from 'express';
import { PRESENCE_CONFIG, PresenceControlConfig } from './presence.config';
import { requireAdminAuth, verifyAdminToken } from '../../middlewares/auth';

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

const activeSessions = new Map<string, ActiveDeviceSession>();

interface SseClient {
  res: Response;
  role: 'admin' | 'client';
}

const sseClients = new Set<SseClient>();

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
    if (!session.has_sse && now - session.last_seen > runtimeConfig.HEARTBEAT_TIMEOUT_MS) {
      activeSessions.delete(key);
      changed = true;
    }
  }
  return changed;
}

export function computeOnlineCount(realCount: number): number {
  return Math.max(0, Math.floor(realCount));
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
  if (sseClients.size === 0) return;
  const adminSummary = getPresenceSummary();
  const adminPayload = `data: ${JSON.stringify({ ...adminSummary, ...(extra || {}) })}\n\n`;
  const clientPayload = `data: ${JSON.stringify({ online_count: adminSummary.online_count, real_online: adminSummary.real_online, ...(extra || {}) })}\n\n`;

  for (const client of sseClients) {
    try {
      client.res.write(client.role === 'admin' ? adminPayload : clientPayload);
    } catch {
      sseClients.delete(client);
    }
  }
}

export function broadcastAdminRefresh() {
  broadcastPresence({ stats_updated: true });
}

setInterval(() => {
  if (pruneExpiredSessions()) {
    broadcastPresence();
  }
}, 3000).unref();

r.get('/', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);
  const isAdmin = Boolean(token && verifyAdminToken(token));
  const summary = getPresenceSummary();

  if (isAdmin) {
    return res.json(summary);
  }

  return res.json({
    online_count: summary.online_count,
    real_online: summary.real_online,
  });
});

r.get('/stream', (req, res) => {
  const role = String(req.query.role || 'client');

  if (role === 'admin') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);
    const verified = token ? verifyAdminToken(token) : null;
    if (!verified) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Yêu cầu token xác thực quản trị viên để kết nối luồng quản trị',
      });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

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

  const sseClient: SseClient = { res, role: role === 'admin' ? 'admin' : 'client' };
  sseClients.add(sseClient);

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
    sseClients.delete(sseClient);
    if (clientKey && activeSessions.has(clientKey)) {
      activeSessions.delete(clientKey);
      broadcastPresence();
    }
  });
});

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

r.post("/control", requireAdminAuth, (_req, res) => {
  return res.status(410).json({
    message: "Đã bỏ chức năng chỉnh số online. Hệ thống dùng số liệu thực.",
  });
});

export function broadcastDishUpdate() {
  const payload = `event: dishes_updated\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

export default r;
