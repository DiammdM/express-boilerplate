import express from "express";
import { register, login } from "../controller/authController.js";
import { validateParamsBody } from "../middleware/validteRequest.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import {
  loginParamReqSchema,
  registerParamReqSchema,
} from "../validators/authSchema.js";

const router = express.Router();

router.post(
  "/register",
  registerLimiter,
  validateParamsBody(registerParamReqSchema),
  register,
);
router.post("/login", loginLimiter, validateParamsBody(loginParamReqSchema), login);

export default router;
