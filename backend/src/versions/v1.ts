import { Router } from "express";
import { authenticateJWT } from "../common/strategies/jwt.strategy";
import mfaRoutes from "../modules/mfa/mfa.routes";
import authRoutes from "../modules/auth/auth.routes";
import regionRoutes from "../modules/region/region.routes";
import sessionRoutes from "../modules/session/session.routes";
import agenceRoutes from "../modules/agence/agence.routes";
import delegationRoutes from "../modules/delegation/delegation.routes";
import applicationRoutes from "../modules/application/application.routes";

const apiV1 = Router();

apiV1.use("/auth", authRoutes);
apiV1.use("/mfa", mfaRoutes);
apiV1.use("/session", authenticateJWT, sessionRoutes);
apiV1.use("/region", regionRoutes);
apiV1.use("/agence", agenceRoutes);
apiV1.use("/delegation", delegationRoutes);
apiV1.use("/application", applicationRoutes);

export { apiV1 };
