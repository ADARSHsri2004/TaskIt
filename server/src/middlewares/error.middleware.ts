import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDbTimeout =
    err?.code === "ETIMEDOUT" ||
    err?.meta?.code === "ETIMEDOUT" ||
    err?.message?.includes("ETIMEDOUT");

  const statusCode = isDbTimeout
    ? 503
    : err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: isDbTimeout
      ? "Database connection timed out. Please check the server database connection and try again."
      : err.message || "Internal Server Error"
  });
};

export default errorHandler;
