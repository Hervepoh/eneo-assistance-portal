import { Op } from "sequelize";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";
import { AssistanceFileModel, AssistanceHistoryModel, AssistanceRequestModel } from "../../database/models";

type CreateDto = {
  regionId: number;
  delegationId: number;
  agenceId: number;
  description: string;
  comment?: string;
  applicationGroupId: number;
  applicationId: number;
  status?: AssistanceStatusEnum;
  superiorUserId?: number;
  files?: { filePath: string; description?: string }[];
  userId: number; // from req.user
};

export class AssistanceService {
  async create(dto: CreateDto) {
    const {
      files,
      userId,
      status = AssistanceStatusEnum.DRAFT,
      ...rest
    } = dto;

    const request = await AssistanceRequestModel.create({
      ...rest,
      userId,
      status,
    });

    // history
    await AssistanceHistoryModel.create({
      assistanceRequestId: request.id,
      userId,
      action: `CREATE_${status}`,
      comment: dto.comment ?? "",
    });

    if (files?.length) {
      const filesToCreate = files.map((f) => ({
        assistanceRequestId: request.id,
        filePath: f.filePath,
        description: f.description ?? "",
      }));
      await AssistanceFileModel.bulkCreate(filesToCreate);
    }

    return request;
  }

  async addFiles(requestId: number, files: { filePath: string; description?: string }[], userId: number) {
    const request = await AssistanceRequestModel.findByPk(requestId);
    if (!request) throw new Error("Request not found");
    const rows = files.map((f) => ({ assistanceRequestId: requestId, filePath: f.filePath, description: f.description ?? "" }));
    const created = await AssistanceFileModel.bulkCreate(rows);

    await AssistanceHistoryModel.create({
      assistanceRequestId: requestId,
      userId,
      action: "ADD_FILES",
      comment: `Added ${created.length} files`,
    });

    return created;
  }

  async findByUser(
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
      q?: string;
    }
  ) {
    const { status, regionId, delegationId, agenceId, applicationGroupId, applicationId, page = 1, limit = 10, q } = filters;
    const where: any = { userId };
    if (status) where.status = status;
    if (regionId) where.regionId = regionId;
    if (delegationId) where.delegationId = delegationId;
    if (agenceId) where.agenceId = agenceId;
    if (applicationGroupId) where.applicationGroupId = applicationGroupId;
    if (applicationId) where.applicationId = applicationId;
    if (q) where.description = { [Op.like]: `%${q}%` };

    const offset = (page - 1) * limit;
    const { rows, count } = await AssistanceRequestModel.findAndCountAll({
      where,
      include: [{ model: AssistanceFileModel, as: "files" }, { model: AssistanceHistoryModel, as: "history" }],
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    return { requests: rows, total: count, page, totalPages: Math.ceil(count / limit) };
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
    return AssistanceRequestModel.findByPk(id, {
      include: [{ model: AssistanceFileModel, as: "files" }, { model: AssistanceHistoryModel, as: "history" }],
    });
  }

  async update(id: number, dto: Partial<CreateDto>, userId: number) {
    const request = await AssistanceRequestModel.findByPk(id);
    if (!request) throw new Error("Request not found");

    await request.update({ ...dto });

    await AssistanceHistoryModel.create({
      assistanceRequestId: id,
      userId,
      action: "UPDATE",
      comment: dto.comment ?? "",
    });

    return request;
  }

  // workflow actions performed by verifier/delegate/business/trainer
  async performAction(
    id: number,
    action: {
      type:
      | "SEND_TO_DELEGUE"
      | "SEND_TO_BUSINESS"
      | "SEND_TO_BOTH"
      | "RETURN_TO_REQUESTER"
      | "VALIDATE_TO_PROCESS"
      | "DELEGUE_VALIDATE"
      | "BUSINESS_VALIDATE"
      | "TRAITER_CLOSE";
      comment?: string;
      actorId: number;
    }
  ) {
    const request = await AssistanceRequestModel.findByPk(id);
    if (!request) throw new Error("Request not found");

    const { type, comment, actorId } = action;
    let newStatus: AssistanceStatusEnum;

    switch (type) {
      case "SEND_TO_DELEGUE":
        newStatus = AssistanceStatusEnum.PENDING_DELEGUE;
        break;
      case "SEND_TO_BUSINESS":
        newStatus = AssistanceStatusEnum.PENDING_BUSINESS;
        break;
      case "SEND_TO_BOTH":
        newStatus = AssistanceStatusEnum.PENDING_BOTH;
        break;
      case "RETURN_TO_REQUESTER":
        newStatus = AssistanceStatusEnum.TO_MODIFY;
        break;
      case "VALIDATE_TO_PROCESS":
        newStatus = AssistanceStatusEnum.TO_PROCESS;
        break;
      case "DELEGUE_VALIDATE":
        // if business already validated or PENDING_BOTH we need to check
        if (request.status === AssistanceStatusEnum.PENDING_BOTH) {
          // mark delegation validated via history, check business validation via history
          // simple approach: check history for BUSINESS_VALIDATE
          const businessValidated = await AssistanceHistoryModel.findOne({
            where: { assistanceRequestId: id, action: "BUSINESS_VALIDATE" },
          });
          newStatus = businessValidated ? AssistanceStatusEnum.TO_PROCESS : AssistanceStatusEnum.PENDING_BUSINESS;
        } else {
          newStatus = AssistanceStatusEnum.TO_PROCESS;
        }
        break;
      case "BUSINESS_VALIDATE":
        if (request.status === AssistanceStatusEnum.PENDING_BOTH) {
          const delegueValidated = await AssistanceHistoryModel.findOne({
            where: { assistanceRequestId: id, action: "DELEGUE_VALIDATE" },
          });
          newStatus = delegueValidated ? AssistanceStatusEnum.TO_PROCESS : AssistanceStatusEnum.PENDING_DELEGUE;
        } else {
          newStatus = AssistanceStatusEnum.TO_PROCESS;
        }
        break;
      case "TRAITER_CLOSE":
        newStatus = AssistanceStatusEnum.CLOSED;
        break;
      default:
        throw new Error("Unknown action");
    }

    await request.update({ status: newStatus });

    await AssistanceHistoryModel.create({
      assistanceRequestId: id,
      userId: actorId,
      action: type,
      comment: comment ?? "",
    });

    return request;
  }

  async delete(id: number, userId: number) {
    const request = await AssistanceRequestModel.findByPk(id);
    if (!request) throw new Error("Request not found");

    await request.destroy();
    await AssistanceHistoryModel.create({
      assistanceRequestId: id,
      userId,
      action: "DELETE",
      comment: "Deleted by user",
    });

    return true;
  }
}

export const assistanceService = new AssistanceService();
