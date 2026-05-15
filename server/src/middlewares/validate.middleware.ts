import { Request, Response, NextFunction } from "express";

const validate =
  (schema: any) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        errors: error.errors
      });
    }
  };

export default validate;