import { Op, WhereOptions } from "sequelize";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";
import { AssistanceFileModel, AssistanceHistoryModel, AssistanceRequestModel, AssistanceRequestViewModel, sequelize, UserModel } from "../../database/models";
import { CreateAssistanceDto } from "./assistance.schemas";
import { AssistanceFilters } from "../../common/interface/assistance.interface";
import { ID } from "../../common/interface/rbac";

// Types des modes de recherche
type RequestMode = 'my' | 'as-n1' | 'all';

export class AssistanceService {

  async create(dto: CreateAssistanceDto) {
    const transaction = await sequelize.transaction();

    try {
      const {
        status,
        titre,
        regionId,
        delegationId,
        agenceId,
        applicationGroupId,
        applicationId,
        userId,
        superiorUserId,
        description,
        files,
        comments,
      } = dto;

      const finalStatus: AssistanceStatusEnum =
        status === "draft"
          ? AssistanceStatusEnum.DRAFT
          : AssistanceStatusEnum.SUBMITTED;

      // Création de la demande d'assistance
      const nouvelleDemande = await AssistanceRequestModel.create({
        status: finalStatus,
        titre,
        description,
        regionId,
        delegationId,
        agenceId,
        userId,
        superiorUserId,
        applicationGroupId,
        applicationId,
      }, { transaction });

      // Traitement des fichiers
      if (files && files.length > 0) {
        // Créer les entrées pour chaque fichier
        const fichiersPromises = files.map((file: any, index: number) => {
          return AssistanceFileModel.create({
            assistanceRequestId: nouvelleDemande.id,
            filePath: file.path,
            description: comments[index] || ''
          }, { transaction });
        });

        await Promise.all(fichiersPromises);
      }

      if (finalStatus === AssistanceStatusEnum.SUBMITTED) {
        // Historique vie de la demande
        await AssistanceHistoryModel.create({
          assistanceRequestId: nouvelleDemande.id,
          action: "Demande créée",
          userId,
        }, { transaction });
      }

      // Commit de la transaction
      await transaction.commit();

      return {
        id: nouvelleDemande.id,
        regionId: regionId,
        delegationId: delegationId,
        agenceId: agenceId,
        applicationGroupId: applicationGroupId,
        applicationId: applicationId,
        userId: userId,
        description: description,
        status: AssistanceStatusEnum.DRAFT,
        createdAt: nouvelleDemande.createdAt
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async submit(id: ID, userId: ID) {
    const request = await AssistanceRequestModel.findByPk(id);
    if (!request) 
      throw new Error("Request not found");

    // ✅ Vérification que le user est bien le propriétaire
    if (request.userId !== userId) 
      throw new Error("You are not allowed to submit this request");
    
    // éviter que quelqu’un "resoumette" une demande déjà traitée
    if (request.status !== AssistanceStatusEnum.DRAFT) 
      throw new Error("Only draft requests can be submitted");
    
    await request.update({ status: AssistanceStatusEnum.SUBMITTED });
    return request;
  }


  /**
  * Factory pour créer la condition de base selon le mode
  */
  private getBaseWhereCondition(mode: RequestMode, userId?: number): WhereOptions {
    switch (mode) {
      case 'as-n1':
        return { superior_user_id: userId };
      case 'my':
        return { user_id: userId };
      case 'all':
        return {};
      default:
        return {};
    }
  }


  /**
   * Méthode unique factorisée pour toutes les recherches
   */
  async findRequests(
    mode: RequestMode,
    userId?: number,
    filters: AssistanceFilters = { page: 1, limit: 10 }
  ) {
    // Sequelize + champ dynamique
    type DynamicWhere = WhereOptions & Record<string, any>;
    const where: DynamicWhere = this.getBaseWhereCondition(mode, userId) as DynamicWhere;

    // ✅ Filtres optionnels
    const optionalFilters: Partial<Record<keyof AssistanceFilters, any>> = {
      status: filters.status,
      regionId: filters.regionId,
      delegationId: filters.delegationId,
      agenceId: filters.agenceId,
      applicationGroupId: filters.applicationGroupId,
      applicationId: filters.applicationId,
      reference: filters.reference,
    };

    // Appliquer les filtres optionnels
    Object.entries(optionalFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        where[dbField] = value;
      }
    });

    // ✅ Recherche textuelle
    if (filters.q) {
      Object.assign(where, {
        [Op.or]: [
          { titre: { [Op.iLike]: `%${filters.q}%` } }, // iLike pour insensible à la casse
          { description: { [Op.iLike]: `%${filters.q}%` } },
          { user_name: { [Op.iLike]: `%${filters.q}%` } },
          { application_name: { [Op.iLike]: `%${filters.q}%` } },
        ],
      });
    }

    // ✅ Pagination
    const offset = (filters.page - 1) * filters.limit;

    const { rows, count } = await AssistanceRequestViewModel.findAndCountAll({
      where,
      offset,
      limit: filters.limit,
      order: [["created_at", "DESC"]],
    });

    return {
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(count / filters.limit),
      data: rows,
    };
  }


  async findByUser(userId: number, filters: AssistanceFilters) {
    return this.findRequests('my', userId, filters);
  }

  async findBySupH(userId: number, filters: AssistanceFilters) {
    return this.findRequests('as-n1', userId, filters);
  }

  async findAll(filters: AssistanceFilters) {
    return this.findRequests('all', undefined, filters);
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

  /**
   * Trouve une demande par son id avec les relations
   */
  async findById(id: number) {
    return AssistanceRequestModel.findByPk(id, {
      include: [{ model: AssistanceFileModel, as: "files" }, { model: AssistanceHistoryModel, as: "history" }],
    });
  }

  /**
   * Trouve une demande par sa référence avec les relations
   */
  async findByReference(reference: string) {
    return AssistanceRequestModel.findOne({
      where: {
        reference: {
          [Op.eq]: reference // Recherche exacte de la référence
        }
      },
      include: [
        {
          model: UserModel,
          as: "requestor",
          attributes: ['id', 'name', 'email']
        },
        //   { 
        //     model: AssistanceFileModel, 
        //     as: "files",
        //     attributes: ['id', 'filePath', 'description', 'createdAt']
        //   },
        //   { 
        //     model: AssistanceHistoryModel, 
        //     as: "history",
        //     attributes: ['id', 'status', 'comment', 'createdAt'],
        //     order: [['createdAt', 'DESC']] // Historique trié du plus récent
        //   }
      ],
    });
  }





  async update(id: number, dto: Partial<any>, userId: number) {
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
      | "SEND_TO_VERIFICATION"
      | "SEND_TO_DELEGUE"
      | "SEND_TO_BUSINESS"
      | "SEND_TO_BOTH"
      | "RETURN_TO_REQUESTER"
      | "VALIDATE_TO_PROCESS"
      | "DELEGUE_VALIDATE"
      | "BUSINESS_VALIDATE"
      | "TRAITER_CLOSE"
      | "REJECT";
      description?: string;
      comment?: string;
      actorId: number;
    }
  ) {
    const request = await AssistanceRequestModel.findByPk(id);
    if (!request) throw new Error("Request not found");

    const { type, description, comment, actorId } = action;
    let newStatus: AssistanceStatusEnum;

    switch (type) {
      case "REJECT":
        newStatus = AssistanceStatusEnum.REJECT;
        break;
       case "SEND_TO_VERIFICATION":
        newStatus = AssistanceStatusEnum.UNDER_VERIFICATION;
        break;
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
      action: description ?? "",
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
