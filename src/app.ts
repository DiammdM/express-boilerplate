import express from "express";
import cors from "cors";
import helmet from "helmet";
import movieRouter from "./router/movieRouter.js";
import authRouter from "./router/authRouter.js";
import userRouter from "./router/userRouter.js";
import { authMiddleware } from "./middleware/authentication.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { createCorsOptions, getTrustProxySetting } from "./config/security.js";

const app = express();
const trustProxy = getTrustProxySetting();
const corsOptions = createCorsOptions();

if (trustProxy !== false) {
  app.set("trust proxy", trustProxy);
}

app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
  }),
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(apiLimiter);

app.use("/auth", authRouter);
app.use("/movie", authMiddleware, movieRouter);
app.use("/user", authMiddleware, userRouter);

export default app;
