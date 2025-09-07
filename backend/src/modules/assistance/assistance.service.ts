import { AssistanceFileModel } from "../../database/models/assistanceFile.model";
import { AssistanceRequestModel } from "../../database/models/assistanceRequest.model";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";
import RegionModel from "../../database/models/region.model";
import DelegationModel from "../../database/models/delegation.model";
import AgenceModel from "../../database/models/agency.model";
import ApplicationGroupModel from "../../database/models/applicationGroup.model";
import ApplicationModel from "../../database/models/application.model";

export class AssistanceService {
  async create(data: any) {
    const { files, ...requestData } = data;
    const request = await AssistanceRequestModel.create(requestData);

    if (files && files.length > 0) {
      const filesToCreate = files.map((f: any) => ({ ...f, requestId: request.id }));
      await AssistanceFileModel.bulkCreate(filesToCreate);
    }

    return request;
  }

  async findAll(status?: AssistanceStatusEnum) {
    const where: any = {};
    if (status) where.status = status;

    return AssistanceRequestModel.findAll({
      where,
      include: [{ model: AssistanceFileModel, as: "files" }],
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id: number) {
    return AssistanceRequestModel.findByPk(id, { include: [{ model: AssistanceFileModel, as: "files" }] });
  }

  async update(id: number, data: any) {
    const request = await this.findById(id);
    if (!request) throw new Error("Demande non trouvée");

    await request.update(data);
    return request;
  }

  async delete(id: number) {
    const request = await this.findById(id);
    if (!request) throw new Error("Demande non trouvée");

    await request.destroy();
    return true;
  }

  async findByUser(userId: number, status?: AssistanceStatusEnum) {
    const where: any = { userId };
    if (status) where.status = status;

    return AssistanceRequestModel.findAll({
      where,
      include: [{ model: AssistanceFileModel, as: "files" }],
      order: [["createdAt", "DESC"]],
    });
  }

    async findByUserwithPagination(
    userId: number,
    filters: {
      status?: string;
      regionId?: number;
      delegationId?: number;
      agenceId?: number;
      applicationGroupId?: number;
      applicationId?: number;
      page?: number;
      limit?: number;
    }
  ) {
    const { status, regionId, delegationId, agenceId, applicationGroupId, applicationId, page = 1, limit = 10 } = filters;

    const where: any = { userId };
    if (status) where.status = status;
    if (regionId) where.regionId = regionId;
    if (delegationId) where.delegationId = delegationId;
    if (agenceId) where.agenceId = agenceId;
    if (applicationGroupId) where.applicationGroupId = applicationGroupId;
    if (applicationId) where.applicationId = applicationId;

    const offset = (page - 1) * limit;

    const { rows: requests, count } = await AssistanceRequestModel.findAndCountAll({
      where,
      include: [
        { model: AssistanceFileModel, as: "files" },
        { model: RegionModel, as: "region" },
        { model: DelegationModel, as: "delegation" },
        { model: AgenceModel, as: "agence" },
        { model: ApplicationGroupModel, as: "applicationGroup" },
        { model: ApplicationModel, as: "application" },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    return {
      requests,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

}


