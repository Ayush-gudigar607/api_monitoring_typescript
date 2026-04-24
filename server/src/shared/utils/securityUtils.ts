type PasswordError = {
  code: string;
  message: string;
};

type PasswordValidationResult = {
  success: boolean;
  errors: PasswordError[];
};

class SecurityUtils {
  static PASSWORD_REQUIREMENTS = Object.freeze({
    minLength: Number.parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),
    maxLength: Number.parseInt(process.env.PASSWORD_MAX_LENGTH || "64", 10),

    requireUppercase:
      (process.env.PASSWORD_REQUIRE_UPPERCASE ?? "true") === "true",
    requireLowercase:
      (process.env.PASSWORD_REQUIRE_LOWERCASE ?? "true") === "true",
    requireNumbers:
      (process.env.PASSWORD_REQUIRE_NUMBERS ?? "true") === "true",
    requireSymbols:
      (process.env.PASSWORD_REQUIRE_SYMBOLS ?? "true") === "true",
  });

  static REGEX = Object.freeze({
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    numbers: /[0-9]/,
    symbols: /[!@#$%^&*(),.?":{}|<>]/,
  });

  static WEAK_PASSWORDS = new Set([
    "password",
    "123456",
    "qwerty",
    "admin",
    "letmein",
    "password123",
    "admin123",
    "12345678",
    "welcome",
  ]);

  static validatePassword(password: string): PasswordValidationResult {
    const errors: PasswordError[] = [];
    const req = this.PASSWORD_REQUIREMENTS;

    // Type check
    if (typeof password !== "string") {
      return {
        success: false,
        errors: [
          { code: "INVALID_TYPE", message: "Password must be a string" },
        ],
      };
    }

    password = password.trim();

    if (!password) {
      return {
        success: false,
        errors: [
          { code: "PASSWORD_REQUIRED", message: "Password is required" },
        ],
      };
    }

    // Length checks
    if (password.length < req.minLength) {
      errors.push({
        code: "PASSWORD_TOO_SHORT",
        message: `Password must be at least ${req.minLength} characters long`,
      });
    }

    if (password.length > req.maxLength) {
      errors.push({
        code: "PASSWORD_TOO_LONG",
        message: `Password must not exceed ${req.maxLength} characters`,
      });
    }

    // Character checks
    if (req.requireUppercase && !this.REGEX.uppercase.test(password)) {
      errors.push({
        code: "UPPERCASE_REQUIRED",
        message: "At least one uppercase letter required",
      });
    }

    if (req.requireLowercase && !this.REGEX.lowercase.test(password)) {
      errors.push({
        code: "LOWERCASE_REQUIRED",
        message: "At least one lowercase letter required",
      });
    }

    if (req.requireNumbers && !this.REGEX.numbers.test(password)) {
      errors.push({
        code: "NUMBER_REQUIRED",
        message: "At least one number required",
      });
    }

    if (req.requireSymbols && !this.REGEX.symbols.test(password)) {
      errors.push({
        code: "SYMBOL_REQUIRED",
        message: "At least one special character required",
      });
    }

    // Weak password check
    if (this.WEAK_PASSWORDS.has(password.toLowerCase())) {
      errors.push({
        code: "WEAK_PASSWORD",
        message:
          "This password is too common. Please choose a stronger password.",
      });
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}

export default SecurityUtils;