export function getMongoUri() {
  return (
    process.env.MONGO_URI?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    ""
  );
}

export function validateEnv() {
  const missing = [];

  if (!getMongoUri()) {
    missing.push("MONGO_URI o MONGODB_URI");
  }

  if (!process.env.JWT_SECRET?.trim()) {
    missing.push("JWT_SECRET");
  }

  if (process.env.NODE_ENV === "production") {
    const hasCorsConfig =
      process.env.CLIENT_URL?.trim() ||
      process.env.CLIENT_URLS?.trim() ||
      process.env.CLIENT_URL_SUFFIXES?.trim();

    if (!hasCorsConfig) {
      missing.push("CLIENT_URL, CLIENT_URLS o CLIENT_URL_SUFFIXES");
    }
  }

  if (missing.length > 0) {
    console.error("Variables de entorno obligatorias faltantes:");
    missing.forEach((name) => console.error(`  - ${name}`));
    process.exit(1);
  }
}
