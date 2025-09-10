// src/controllers/reference.controller.ts
import { Request, Response } from "express";
import { ReferenceService } from "./reference.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";

export class ReferenceController {
    private readonly service: ReferenceService;
    constructor(service: ReferenceService) {
        this.service = service;
    }

    public getOrganisations = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.getOrganizationReferences();

        return res.status(HTTPSTATUS.OK).json({ message: "References retrieved", data });
    })

    public getApplications = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.getApplicationReferences();

        return res.status(HTTPSTATUS.OK).json({ message: "References retrieved", data });
    })

}