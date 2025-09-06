import { NotFoundException } from "../../common/utils/catch-errors";
import SessionModel from "../../database/models/session.model";
import UserModel from "../../database/models/user.model";
import { Op } from "sequelize";

export class SessionService {
  // Récupérer toutes les sessions d'un utilisateur
  public async getAllSession(userId: number) {
    const sessions = await SessionModel.findAll({
      where: { userId, expiredAt: { [Op.gt]: new Date() } },
      attributes: ["id", "userId", "userAgent", "createdAt", "expiredAt"],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return { sessions };
  }

  // Récupérer une session spécifique
  public async getSessionById(sessionId: number) {
    const session = await SessionModel.findByPk(sessionId, {
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      attributes: { exclude: ["expiredAt"] },
    });

    if (!session) throw new NotFoundException("Session not found");

    return { user: session.user, session };
  }

  // Supprimer une session
  public async deleteSession(sessionId: number, userId: number) {
    const deleted = await SessionModel.destroy({
      where: { id: sessionId, userId },
    });

    if (!deleted) throw new NotFoundException("Session not found");
  }
}
