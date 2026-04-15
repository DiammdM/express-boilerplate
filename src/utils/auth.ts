import "dotenv/config";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as NonNullable<
  SignOptions["expiresIn"]
>;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

type AuthTokenPayload = {
  userId: number;
};

const buildSignOptions = (): SignOptions => {
  return {
    expiresIn: JWT_EXPIRES_IN,
    ...(JWT_ISSUER ? { issuer: JWT_ISSUER } : {}),
    ...(JWT_AUDIENCE ? { audience: JWT_AUDIENCE } : {}),
  };
};

const generateToken = (userId: AuthTokenPayload["userId"]) => {
  const payload: AuthTokenPayload = { userId };

  return jwt.sign(payload, JWT_SECRET, buildSignOptions());
};

const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET, {
    ...(JWT_ISSUER ? { issuer: JWT_ISSUER } : {}),
    ...(JWT_AUDIENCE ? { audience: JWT_AUDIENCE } : {}),
  }) as JwtPayload & AuthTokenPayload;
};

export { generateToken, verifyToken };
export type { AuthTokenPayload };
