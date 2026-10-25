
import express from "express";
import "dotenv/config.js";
import pool from "./config/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import documentRoutes from "./modules/documents/documents.routes.js";
import questionRoutes from "./modules/questions/questions.routes.js";
import cors from "cors";

//dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/questions", questionRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "AI Assistant API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, current_user AS user"
    );

    res.status(200).json({
      status: "success",
      message: "Database connection successful",
      database: result.rows[0].database,
      user: result.rows[0].user,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
