import { Router } from "express";
import { authenticateJWT } from "../common/strategies/jwt.strategy";
import mfaRoutes from "../modules/mfa/mfa.routes";
import authRoutes from "../modules/auth/auth.routes";
import regionRoutes from "../modules/region/region.routes";
import sessionRoutes from "../modules/session/session.routes";
import agenceRoutes from "../modules/agence/agence.routes";
import delegationRoutes from "../modules/delegation/delegation.routes";
import applicationRoutes from "../modules/application/application.routes";
import assistanceRoutes from "../modules/assistance/assistance.routes";
import userRoutes from "../modules/user/user.routes";
import roleRoutes from "../modules/role/role.routes";
import permissionRoutes from "../modules/permission/permission.routes";
import referenceRoutes from "../modules/references/reference.routes";

const apiV1 = Router();

apiV1.use("/auth", authRoutes);
apiV1.use("/mfa", mfaRoutes);
apiV1.use("/session", authenticateJWT, sessionRoutes);
apiV1.use("/region", regionRoutes);
apiV1.use("/agence", agenceRoutes);
apiV1.use("/delegation", delegationRoutes);
apiV1.use("/application", applicationRoutes);
apiV1.use("/assistance", assistanceRoutes);
apiV1.use("/user", userRoutes);
apiV1.use("/role", roleRoutes);
apiV1.use("/permission", permissionRoutes);
apiV1.use("/references", referenceRoutes);

export { apiV1 };
