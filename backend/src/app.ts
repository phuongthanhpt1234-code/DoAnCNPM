import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { errorHandler } from "./middlewares/error";
import { requireAdminAuth } from "./middlewares/auth";
import auth from "./modules/auth/auth.routes";
import categories from "./modules/categories/categories.routes";
import checkins from "./modules/checkins/checkins.routes";
import dishes from "./modules/dishes/dishes.routes";
import favorites from "./modules/favorites/favorites.routes";
import presence from "./modules/presence/presence.routes";
import stats from "./modules/stats/stats.routes";
import qrcodes from "./modules/qrcodes/qrcodes.routes";

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.text({ type: "text/plain" }));

app.use((req, res, next) => {
  if (!req.path.startsWith("/uploads")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }
  next();
});

app.use((req, _res, next) => {
  console.log(new Date().toLocaleTimeString(), req.method, req.url);
  next();
});

app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    supported_languages: ["vi", "en", "zh", "ko", "ja"],
  }),
);

const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post("/api/upload", requireAdminAuth, (req, res) => {
  const { filename, dataUrl } = req.body || {};

  if (typeof dataUrl !== "string") {
    return res.status(400).json({
      code: "INVALID_IMAGE",
      message: "Vui lòng chọn ảnh hợp lệ.",
    });
  }

  const match = dataUrl.match(
    /^data:image\/(jpeg|jpg|png|webp|gif|avif);base64,([A-Za-z0-9+/]+={0,2})$/i,
  );
  if (!match) {
    return res.status(400).json({
      code: "INVALID_IMAGE",
      message: "Ảnh phải có định dạng JPEG, PNG, WEBP, GIF hoặc AVIF.",
    });
  }

  const mimeExt = match[1].toLowerCase();
  const ext = mimeExt === "jpeg" ? "jpg" : mimeExt;
  const imageBuffer = Buffer.from(match[2], "base64");
  const maxImageBytes = 10 * 1024 * 1024;

  if (!imageBuffer.length || imageBuffer.length > maxImageBytes) {
    return res.status(413).json({
      code: "IMAGE_TOO_LARGE",
      message: "Ảnh sau khi nén không được vượt quá 10 MB.",
    });
  }

  const baseName = String(filename || "dish")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  const finalName = `${Date.now()}-${baseName || "dish"}.${ext}`;
  const filePath = path.join(uploadsDir, finalName);

  try {
    fs.writeFileSync(filePath, imageBuffer);
  } catch (error) {
    console.error("Không thể lưu ảnh:", error);
    return res.status(500).json({
      code: "UPLOAD_FAILED",
      message: "Máy chủ không thể lưu ảnh. Vui lòng thử lại.",
    });
  }

  const protoHeader = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || req.protocol || "https";
  const host = req.get("host") || "";
  const hostUrl = host.includes("onrender.com") ? `https://${host}` : `${proto}://${host}`;

  return res.status(201).json({
    url: `${hostUrl}/uploads/${finalName}`,
    path: `/uploads/${finalName}`,
  });
});

app.use("/api/auth", auth);
app.use("/api/categories", categories);
app.use("/api/dishes", dishes);
app.use("/api/favorites", favorites);
app.use("/api/checkins", checkins);
app.use("/api/presence", presence);
app.use("/api/stats", stats);
app.use("/api/qrcodes", qrcodes);

const publicDir = path.join(__dirname, "..", "public");
app.use("/uploads", express.static(uploadsDir));
app.use("/admin", express.static(publicDir));
app.use(express.static(publicDir));

app.use(errorHandler);
export default app;
