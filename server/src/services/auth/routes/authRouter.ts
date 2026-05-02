import express, { Router } from "express";
import dependencies from "../Dependencies/dependencies.js";
import authenticate from "../../../shared/middlewares/authenticate.js";
import validate from "../../../shared/middlewares/validate.js";
import authorize from "../../../shared/middlewares/authorize.js";
import requestLogger from "../../../shared/middlewares/requestlogger.js";
import {
  onboardSuperAdminSchema,
  loginSchema,
  registrationSchema,
} from "../validation/authSchema.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";

/* ================= ROUTER ================= */

const router: Router = express.Router();

/* ================= DEPENDENCIES ================= */

const { controllers } = dependencies;
const authController = controllers.authController; 

/* ================= ROUTES ================= */

// Public Routes
router.post(
  "/onboard-super-admin",
  requestLogger,
  validate(onboardSuperAdminSchema),
  authController.onboardSuperAdmin.bind(authController)
);

router.post(
  "/login",
  requestLogger,
  validate(loginSchema),
  authController.login.bind(authController)
);

// Protected Routes
router.post(
  "/register",
  requestLogger,
  authenticate,
  authorize([APPLICATION_ROLES.SUPER_ADMIN]),
  validate(registrationSchema),
  authController.register.bind(authController)
);

router.get(
  "/profile",
  requestLogger,
  authenticate,
  authController.getProfile.bind(authController)
);

router.post(
  "/logout",
  requestLogger,
  authenticate,
  authController.logout.bind(authController)
);

export default router;
