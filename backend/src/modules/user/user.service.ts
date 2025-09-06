import UserModel from "../../database/models/user.model";

export class UserService {
  public async findUserById(userId: number) {
    const user = await UserModel.findByPk(userId, {
      attributes: { exclude: ["password"] }, // exclut le mot de passe
    });
    return user || null;
  }
}
