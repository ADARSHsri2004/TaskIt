import {
  Request,
  Response,
  NextFunction
} from "express";

import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer "
    )
  ) {
    throw new ApiError(
      401,
      "Unauthorized"
    );
  }

  const token =
    authHeader.split(" ")[1];

  try {
    const decoded: any =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      );

    req.user = decoded;

    next();
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid token"
    );
  }
};

export const authorize =
  (...roles: string[]) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      throw new ApiError(
        403,
        "Forbidden"
      );
    }

    next();
  };