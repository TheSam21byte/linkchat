import express from "express";
import cors from "cors";

import { corsOptions } from "../../infrastructure/config/cors.js";
import {
  globalErrorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import { registerHttpRoutes } from "./routes/index.js";

export function createHttpApp() {
  const app = express();

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(cors(corsOptions));
  app.use(express.json());

  registerHttpRoutes(app);

  app.use(notFoundMiddleware);
  app.use(globalErrorMiddleware);

  return app;
}

export default createHttpApp();
