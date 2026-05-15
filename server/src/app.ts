import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import notFound from "./middlewares/notFound.middleware";
import errorHandler from "./middlewares/error.middleware";

const app = express();

app.use(cors());

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
app.use(notFound);

app.use(errorHandler);

export default app;