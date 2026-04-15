import type { CorsOptions } from "cors";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const DEFAULT_CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const DEFAULT_CORS_HEADERS = ["Authorization", "Content-Type"];

const parseOrigins = (originsValue?: string) => {
  if (!originsValue) {
    return [];
  }

  return originsValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getAllowedOrigins = ({
  origins = process.env.CORS_ORIGINS,
  nodeEnv = process.env.NODE_ENV,
}: {
  origins?: string | undefined;
  nodeEnv?: string | undefined;
} = {}) => {
  const configuredOrigins = parseOrigins(origins);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (nodeEnv === "production") {
    return [];
  }

  return DEFAULT_CORS_ORIGINS;
};

const createCorsOptions = ({
  origins = process.env.CORS_ORIGINS,
  nodeEnv = process.env.NODE_ENV,
}: {
  origins?: string | undefined;
  nodeEnv?: string | undefined;
} = {}): CorsOptions => {
  const allowedOrigins = getAllowedOrigins({ origins, nodeEnv });

  return {
    origin(requestOrigin: string | undefined, callback) {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.includes(requestOrigin));
    },
    methods: DEFAULT_CORS_METHODS,
    allowedHeaders: DEFAULT_CORS_HEADERS,
    credentials: false,
    optionsSuccessStatus: 204,
  };
};

const getTrustProxySetting = (trustProxy = process.env.TRUST_PROXY) => {
  if (!trustProxy || trustProxy === "false") {
    return false;
  }

  if (trustProxy === "true") {
    return 1;
  }

  const numericValue = Number(trustProxy);

  if (Number.isInteger(numericValue) && numericValue >= 1) {
    return numericValue;
  }

  return trustProxy;
};

export {
  createCorsOptions,
  DEFAULT_CORS_HEADERS,
  DEFAULT_CORS_METHODS,
  DEFAULT_CORS_ORIGINS,
  getAllowedOrigins,
  getTrustProxySetting,
};
