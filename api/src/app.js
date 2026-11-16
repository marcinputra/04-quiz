import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "./db.js";
import { loadUser } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import quizRoutes from "./routes/quizzes.js";
import adminRoutes from "./routes/admin.js";
import attemptRoutes from "./routes/attempts.js";
import courseRoutes from "./routes/courses.js";
import { publicRouter as articleRoutes, adminRouter as adminArticleRoutes } from "./routes/articles.js";

export const app = express();

// API stoi za nginx (i Traefikiem) w sieci Dockera — ufamy adresom prywatnym,
// żeby req.ip był prawdziwym IP użytkownika (ważne dla limitów logowania)
app.set("trust proxy", "loopback, linklocal, uniquelocal");
app.disable("x-powered-by");

app.use(express.json({ limit: "2mb" })); // artykuły do 200 tys. znaków
app.use(cookieParser());
app.use(loadUser);

// Czy API i baza działają
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok" });
  } catch {
    res.status(503).json({ status: "error", db: "unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin/articles", adminArticleRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Nie znaleziono" });
});

app.use((err, req, res, next) => {
  // zły JSON w body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Niepoprawny format danych." });
  }
  console.error(err);
  res.status(500).json({ error: "Błąd serwera" });
});
