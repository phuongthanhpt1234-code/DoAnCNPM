import cors from "cors";
import express from "express";
import path from "path";
import { errorHandler } from "./middlewares/error";
import categories from "./modules/categories/categories.routes";
import checkins from "./modules/checkins/checkins.routes";
import dishes from "./modules/dishes/dishes.routes";
import favorites from "./modules/favorites/favorites.routes";
import stats from "./modules/stats/stats.routes";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/categories", categories);
app.use("/api/dishes", dishes);
app.use("/api/favorites", favorites);
app.use("/api/checkins", checkins);
app.use("/api/stats", stats);

// Dashboard quản trị: mở http://localhost:4000
app.use(express.static(path.join(__dirname, "..", "public")));
app.use((req, _res, next) => {
  console.log(new Date().toLocaleTimeString(), req.method, req.url);
  next();
});
app.use(errorHandler);
export default app;
