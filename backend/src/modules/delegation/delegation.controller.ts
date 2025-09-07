import { Request, Response } from "express";
import { DelegationService } from "./delegation.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { createDelegationSchema, updateDelegationSchema } from "../../common/validators/delegation.validation";

export class DelegationController {
    private readonly service: DelegationService;
    constructor(service: DelegationService) {
        this.service = service;
    }

    public createDelegation = asyncHandler(async (req: Request, res: Response) => {
        const delegation = await this.service.createDelegation(createDelegationSchema.parse({
            ...req.body,
        }));
        return res.status(HTTPSTATUS.CREATED).json({ message: "Delegation created", delegation });
    });

    public getAllDelegations = asyncHandler(async (req: Request, res: Response) => {
        const delegations = await this.service.getAllDelegations();
        return res.status(HTTPSTATUS.OK).json({ message: "Delegations retrieved", delegations });
    });

    public getDelegation = asyncHandler(async (req: Request, res: Response) => {
        const delegation = await this.service.getDelegationById(Number(req.params.id));
        return res.status(HTTPSTATUS.OK).json({ message: "Delegation retrieved", delegation });
    });

    public updateDelegation = asyncHandler(async (req: Request, res: Response) => {
        const delegation = await this.service.updateDelegation(
            Number(req.params.id),
            updateDelegationSchema.parse(req.body)
        );
        return res.status(HTTPSTATUS.OK).json({ message: "Delegation updated", delegation });
    });

    public deleteDelegation = asyncHandler(async (req: Request, res: Response) => {
        await this.service.deleteDelegation(Number(req.params.id));
        return res.status(HTTPSTATUS.OK).json({ message: "Delegation deleted" });
    });
}
