import { Request, Response, NextFunction } from "express";
import ResponseFormatter from "../utils/ResponceFormattor";

// Define validation rule type
type ValidationRule = {
  required?: boolean;
  minLength?: number;
  custom?: (value: any, body: any) => string | null;
};

// Schema type
type ValidationSchema = Record<string, ValidationRule>;

const validate =
  (schema: ValidationSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!schema) {
      return next();
    }

    const errors: string[] = [];
    const body = req.body || {};

    Object.entries(schema).forEach(([field, rules]) => {
      const value = body[field];

      // Required check
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        return;
      }

      // Min length check
      if (
        rules.minLength &&
        typeof value === "string" &&
        value.length < rules.minLength
      ) {
        errors.push(
          `${field} must be at least ${rules.minLength} characters long`
        );
        return;
      }

      // Custom validation
      if (rules.custom && typeof rules.custom === "function") {
        const customError = rules.custom(value, body);
        if (customError) {
          errors.push(customError);
        }
      }
    });

    if (errors.length > 0) {
      res
        .status(400)
        .json(ResponseFormatter.error("Validation failed", 400, errors));
      return;
    }

    next();
  };

export default validate;