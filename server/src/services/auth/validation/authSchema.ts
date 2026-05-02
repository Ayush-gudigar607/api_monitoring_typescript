import { isValidRole } from "../../../shared/constants/roles.js";

/* ================= TYPES ================= */

type ValidationResult = string | null;

type FieldSchema<T = any> = {
  required?: boolean;
  minLength?: number;
  custom?: (value: T) => ValidationResult;
};

type Schema = Record<string, FieldSchema>;

/* ================= COMMON VALIDATORS ================= */

const emailValidator = (value: string): ValidationResult => {
  return /\S+@\S+\.\S+/.test(value) ? null : "Invalid email";
};

/* ================= SCHEMAS ================= */

export const onboardSuperAdminSchema: Schema = {
  username: { required: true, minLength: 3 },

  email: {
    required: true,
    custom: emailValidator,
  },

  password: {
    required: true,
    minLength: 8,
  },
};

export const registrationSchema: Schema = {
  username: { required: true, minLength: 3 },

  email: {
    required: true,
    custom: emailValidator,
  },

  password: {
    required: true,
    minLength: 8,
  },

  role: {
    required: false,
    custom: (value: string): ValidationResult => {
      if (!value) return null;
      return isValidRole(value) ? null : "Invalid role";
    },
  },
};

export const loginSchema: Schema = {
  username: { required: true },
  password: { required: true },
};