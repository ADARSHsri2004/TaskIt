import { Request, Response, NextFunction } from "express";

const validate =
  (schema: any) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues || error.errors
      });
    }
  };

export default validate;
