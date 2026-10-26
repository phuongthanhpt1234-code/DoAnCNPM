import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { errorHandler } from "./middlewares/error";
import categories from "./modules/categories/categories.routes";
import checkins from "./modules/checkins/checkins.routes";
import dishes from "./modules/dishes/dishes.routes";
import favorites from "./modules/favorites/favorites.routes";
import presence from "./modules/presence/presence.routes";
import stats from "./modules/stats/stats.routes";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.text({ type: "text/plain" }));

// Ghi log mọi request trước khi đi vào các route API
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

// API tải ảnh món ăn từ máy tính lưu vào thư mục public/uploads
const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post("/api/upload", (req, res) => {
  const { filename, dataUrl } = req.body || {};
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return res
      .status(400)
      .json({ code: "INVALID_IMAGE", message: "File ảnh không hợp lệ" });
  }
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return res
      .status(400)
      .json({ code: "INVALID_IMAGE", message: "Định dạng ảnh không hợp lệ" });
  }
  const rawExt = match[1].toLowerCase().replace("jpeg", "jpg");
  const ext = ["jpg", "png", "webp", "gif", "avif"].includes(rawExt)
    ? rawExt
    : "jpg";
  const baseName = String(filename || "dish")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  const finalName = `${Date.now()}-${baseName || "dish"}.${ext}`;
  const filePath = path.join(uploadsDir, finalName);

  fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
  const hostUrl = `${req.protocol}://${req.get("host")}`;
  return res.status(201).json({
    url: `${hostUrl}/uploads/${finalName}`,
    path: `/uploads/${finalName}`,
  });
});

app.use("/api/categories", categories);
app.use("/api/dishes", dishes);
app.use("/api/favorites", favorites);
app.use("/api/checkins", checkins);
app.use("/api/presence", presence);
app.use("/api/stats", stats);

// Dashboard quản trị: mở http://localhost:4000 hoặc http://localhost:4000/admin
const publicDir = path.join(__dirname, "..", "public");
app.use("/admin", express.static(publicDir));
app.use(express.static(publicDir));

app.use(errorHandler);
export default app;
