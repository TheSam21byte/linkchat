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

  app.use(cors(corsOptions));
  app.use(express.json());

  registerHttpRoutes(app);

  app.use(notFoundMiddleware);
  app.use(globalErrorMiddleware);

  return app;
}

export default createHttpApp();
