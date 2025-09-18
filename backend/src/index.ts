import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import { HTTPSTATUS } from "./config/http.config";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorHandler";
import { asyncHandler } from "./middlewares/asyncHandler";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter";

import passport from "./middlewares/passport";
import { apiV1, apiV2 } from "./versions";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Charger les origins CORS depuis .env
const allowedOrigins = config.APP_ORIGIN
  ? config.APP_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // origin: config.APP_ORIGIN,
    origin: (origin, callback) => 
      //(si origin est undefined (Postman, cURL, tests backend) → ça sera bloqué.)
      !origin || allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error("🚫 Origin non autorisée par CORS")),
    credentials: true,
  })
);

app.use(cookieParser());
app.use(passport.initialize());

// RateLimiter globale pour toute l’API
app.use(rateLimiterMiddleware);

// Healthcheck
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Healthcheck !!!",
    });
  })
);

// ✅ Versioning
app.use(`${BASE_PATH}/v1`, apiV1);
app.use(`${BASE_PATH}/v2`, apiV2);

// Gestion des erreurs
app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
