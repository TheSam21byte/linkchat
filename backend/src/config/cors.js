const normalizeOrigin = (origin) => origin?.trim().replace(/\/+$/, "");

const getAllowedOrigins = () => {
  const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || "";

  return rawOrigins
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
};

export const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) return false;

  return allowedOrigins.includes(normalizeOrigin(origin));
};

export const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  }
};

export const socketCorsOptions = {
  ...corsOptions,
  methods: ["GET", "POST"]
};
