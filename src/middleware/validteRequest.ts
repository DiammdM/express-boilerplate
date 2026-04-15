import { type NextFunction, type Request, type Response } from "express";
import type { ZodObject } from "zod";

const validateParamsBody = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const path = issue.path.join(".");

        return path ? `${path}: ${issue.message}` : issue.message;
      });

      res.status(400).json({
        message: errors.join("; "),
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};

export { validateParamsBody };
