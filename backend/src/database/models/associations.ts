// src/database/models/associations.ts
import { ApplicationGroupModel } from "./applicationGroup.model";
import { ApplicationModel } from "./application.model";
import { RegionModel } from "./region.model";
import { DelegationModel } from "./delegation.model";
import { AgenceModel } from "./agency.model";
import { AssistanceRequestModel } from "./assistanceRequest.model";
import { AssistanceFileModel } from "./assistanceFile.model";
import { AssistanceHistoryModel } from "./assistanceHistory.model";
import { UserModel } from "./user.model";
import { RoleModel } from "./role.model";
import { PermissionModel } from "./permission.model";
import { UserRoleModel } from "./userRole.model";
import { RolePermissionModel } from "./rolePermission.model";
import { SessionModel } from "./session.model";
import { VerificationCodeModel } from "./verification.model";
// Importez votre modèle d'audit si vous en avez un
// import { AuditModel } from "./audit.model";

export function setupAssociations(): void {
  // 1. ApplicationGroup 1 -> N Application
  ApplicationGroupModel.hasMany(ApplicationModel, {
    foreignKey: "groupId",
    as: "applications",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  ApplicationModel.belongsTo(ApplicationGroupModel, {
    foreignKey: "groupId",
    as: "group",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  // 2. Region 1 -> N Delegation
  RegionModel.hasMany(DelegationModel, {
    foreignKey: "regionId",
    as: "delegations",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  DelegationModel.belongsTo(RegionModel, {
    foreignKey: "regionId",
    as: "region",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  // 3. Delegation 1 -> N Agence
  DelegationModel.hasMany(AgenceModel, {
    foreignKey: "delegationId",
    as: "agences",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  AgenceModel.belongsTo(DelegationModel, {
    foreignKey: "delegationId",
    as: "delegation",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  // 4. AssistanceRequest 1 -> N AssistanceFile
  AssistanceRequestModel.hasMany(AssistanceFileModel, {
    foreignKey: "assistanceRequestId",
    as: "files",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  AssistanceFileModel.belongsTo(AssistanceRequestModel, {
    foreignKey: "assistanceRequestId",
    as: "request",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  // 5. AssistanceRequest 1 -> N AssistanceHistory
  AssistanceRequestModel.hasMany(AssistanceHistoryModel, {
    foreignKey: "assistanceRequestId",
    as: "history",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  AssistanceHistoryModel.belongsTo(AssistanceRequestModel, {
    foreignKey: "assistanceRequestId",
    as: "request",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  // 6. User N -> M Role (via UserRoleModel)
  UserModel.belongsToMany(RoleModel, {
    through: UserRoleModel,
    foreignKey: "user_id",
    otherKey: "role_id",
    as: "roles",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  RoleModel.belongsToMany(UserModel, {
    through: UserRoleModel,
    foreignKey: "role_id",
    otherKey: "user_id",
    as: "users",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  // 7. Role N -> M Permission (via RolePermissionModel)
  RoleModel.belongsToMany(PermissionModel, {
    through: RolePermissionModel,
    foreignKey: "role_id",
    otherKey: "permission_id",
    as: "permissions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  PermissionModel.belongsToMany(RoleModel, {
    through: RolePermissionModel,
    foreignKey: "permission_id",
    otherKey: "role_id",
    as: "roles",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  // 8. User 1 -> N Session
  UserModel.hasMany(SessionModel, {
    foreignKey: "userId",
    as: "sessions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  SessionModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  // 9. User 1 -> N VerificationCode
  UserModel.hasMany(VerificationCodeModel, {
    foreignKey: "userId",
    as: "verificationCodes",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  VerificationCodeModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });

  // 10. Relations pour les tables de jointure
  UserRoleModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"
  });

  UserRoleModel.belongsTo(RoleModel, {
    foreignKey: "roleId",
    as: "role"
  });

  RolePermissionModel.belongsTo(RoleModel, {
    foreignKey: "roleId",
    as: "role"
  });

  RolePermissionModel.belongsTo(PermissionModel, {
    foreignKey: "permissionId",
    as: "permission"
  });

  // 11. Relations avec AssistanceRequest (demandeur, délégué, etc.)
  AssistanceRequestModel.belongsTo(UserModel, {
    foreignKey: "requesterId",
    as: "requester",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  AssistanceRequestModel.belongsTo(UserModel, {
    foreignKey: "delegueId",
    as: "delegue",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  AssistanceRequestModel.belongsTo(UserModel, {
    foreignKey: "businessId",
    as: "business",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  AssistanceRequestModel.belongsTo(AgenceModel, {
    foreignKey: "agenceId",
    as: "agence",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  // 12. Relations pour l'audit (si vous avez un modèle Audit)
  /*
  UserModel.hasMany(AuditModel, {
    foreignKey: "userId",
    as: "auditLogs",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  AuditModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });

  AuditModel.belongsTo(ApplicationModel, {
    foreignKey: "applicationId",
    as: "application",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });
  */
}

export function verifyAssociations(): void {
  console.log("Vérification des associations...");
  
  // Vérification des associations principales
  const modelsWithAssociations = [
    ApplicationGroupModel, ApplicationModel,
    RegionModel, DelegationModel, AgenceModel,
    AssistanceRequestModel, AssistanceFileModel, AssistanceHistoryModel,
    UserModel, RoleModel, PermissionModel,
    SessionModel, VerificationCodeModel
  ];
  
  modelsWithAssociations.forEach(model => {
    console.log(`${model.name} associations:`, model.associations !== undefined);
  });
  
  console.log("Toutes les associations ont été configurées.");
}