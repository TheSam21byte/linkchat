const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

const normalizeOrigin = (origin) => origin?.trim().replace(/\/+$/, "");

const normalizeHostSuffix = (suffix) =>
  suffix
    ?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .toLowerCase();

const getAllowedOrigins = () => {
  const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || "";

  const configuredOrigins = rawOrigins
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    return [...new Set([...configuredOrigins, ...defaultDevOrigins])];
  }

  return configuredOrigins;
};

const getAllowedHostSuffixes = () => {
  const rawSuffixes = process.env.CLIENT_URL_SUFFIXES || "";

  return rawSuffixes
    .split(",")
    .map(normalizeHostSuffix)
    .filter(Boolean);
};

const getOriginHost = (origin) => {
  try {
    return new URL(origin).host.toLowerCase();
  } catch {
    return "";
  }
};

const isHostAllowedBySuffix = (host, suffix) => {
  if (!host || !suffix) return false;

  if (suffix.startsWith("-")) {
    return host.endsWith(suffix);
  }

  return host === suffix || host.endsWith(`.${suffix}`);
};

export const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();
  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin)) return true;

  const originHost = getOriginHost(normalizedOrigin);
  const allowedHostSuffixes = getAllowedHostSuffixes();

  return allowedHostSuffixes.some((suffix) =>
    isHostAllowedBySuffix(originHost, suffix)
  );
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
