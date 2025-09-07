import { Request, Response } from "express";
import { RegionService } from "./region.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";

export class RegionController {
  constructor(private regionService: RegionService) {}

  public createRegion = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const region = await this.regionService.createRegion(name);
    res.status(HTTPSTATUS.CREATED).json({ message: "Region created", region });
  });

  public getAllRegions = asyncHandler(async (req: Request, res: Response) => {
    const regions = await this.regionService.getAllRegions();
    res.status(HTTPSTATUS.OK).json({ message: "Regions retrieved", regions });
  });

  public getRegion = asyncHandler(async (req: Request, res: Response) => {
    const region = await this.regionService.getRegionById(Number(req.params.id));
    res.status(HTTPSTATUS.OK).json({ message: "Region retrieved", region });
  });

  public updateRegion = asyncHandler(async (req: Request, res: Response) => {
    const region = await this.regionService.updateRegion(
      Number(req.params.id),
      req.body.name
    );
    res.status(HTTPSTATUS.OK).json({ message: "Region updated", region });
  });

  public deleteRegion = asyncHandler(async (req: Request, res: Response) => {
    await this.regionService.deleteRegion(Number(req.params.id));
    res.status(HTTPSTATUS.OK).json({ message: "Region deleted" });
  });
}
