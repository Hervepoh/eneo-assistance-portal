// src/routes/reference.routes.ts
import { Router } from "express";
import { referenceController } from "./reference.module";

const referenceRoutes = Router();

referenceRoutes.get("/organizations", referenceController.getOrganisations);
referenceRoutes.get("/applications", referenceController.getApplications);


export default referenceRoutes;

