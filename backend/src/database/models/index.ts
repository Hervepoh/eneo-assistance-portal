// src/database/models/index.ts
import { sequelize } from '../database';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './rolePermission.model';
import { ApplicationModel } from './application.model';
import { ApplicationGroupModel } from './applicationGroup.model';
import { setupAssociations } from './associations';
import { RegionModel } from './region.model';
import { DelegationModel } from './delegation.model';
import { AgenceModel } from './agency.model';
import {AssistanceFileModel} from './assistanceFile.model';
import {AssistanceHistoryModel} from './assistanceHistory.model';
import {AssistanceRequestModel} from './assistanceRequest.model';
import { VerificationCodeModel } from './verification.model';
import { SessionModel } from './session.model';
import {UserRoleModel} from './userRole.model';
import { UserModel } from './user.model';
import { SessionUserRolesPermissionsViewModel } from './VuserRolesPermissions.view.model.';


// Initialiser tous les modèles dans l'ordre correct
// 1. Modèles indépendants
ApplicationGroupModel.initialize(sequelize);
ApplicationModel.initialize(sequelize);

RegionModel.initialize(sequelize);
DelegationModel.initialize(sequelize);
AgenceModel.initialize(sequelize);

UserModel.initialize(sequelize);
RoleModel.initialize(sequelize);
PermissionModel.initialize(sequelize);
SessionModel.initialize(sequelize);
VerificationCodeModel.initialize(sequelize);

AssistanceRequestModel.initialize(sequelize);
AssistanceFileModel.initialize(sequelize);
AssistanceHistoryModel.initialize(sequelize);

// 2. Modèles dépendants
RolePermissionModel.initialize(sequelize);
UserRoleModel.initialize(sequelize);

// 3- Vue Modèle 
SessionUserRolesPermissionsViewModel.initialize(sequelize)

// Configurer les associations
setupAssociations();

// Vérifier les associations (optionnel, pour le débogage)
// verifyAssociations();

export {
    sequelize,
    ApplicationGroupModel,
    ApplicationModel,
    RegionModel,
    DelegationModel,
    AgenceModel,
    UserModel,
    RoleModel,
    PermissionModel,
    SessionModel,
    VerificationCodeModel,
    UserRoleModel,
    RolePermissionModel,
    AssistanceRequestModel,
    AssistanceFileModel,
    AssistanceHistoryModel,
    SessionUserRolesPermissionsViewModel
};