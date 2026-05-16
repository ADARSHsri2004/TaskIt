import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import notFound from "./middlewares/notFound.middleware";
import errorHandler from "./middlewares/error.middleware";
import taskRoutes from "./routes/task.routes";
import adminRoutes from "./routes/admin.routes";
import path from "path";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://task-it-xi.vercel.app/"
  ],
  credentials: true
}));

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TaskIt API Running"
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(notFound);

app.use(errorHandler);

export default app;