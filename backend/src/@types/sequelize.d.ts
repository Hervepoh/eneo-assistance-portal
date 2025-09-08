// src/database/types/sequelize.d.ts
import { 
  BelongsToGetAssociationMixin, 
  HasManyGetAssociationsMixin, 
  BelongsToSetAssociationMixin,
  HasManySetAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin
} from "sequelize";

// Déclarations de types pour toutes les associations
declare module "sequelize" {
  interface ApplicationGroupModel {
    getApplications: HasManyGetAssociationsMixin<ApplicationModel>;
    setApplications: HasManySetAssociationsMixin<ApplicationModel, number>;
    applications?: ApplicationModel[];
  }

  interface ApplicationModel {
    getGroup: BelongsToGetAssociationMixin<ApplicationGroupModel>;
    setGroup: BelongsToSetAssociationMixin<ApplicationGroupModel, number>;
    group?: ApplicationGroupModel;
  }

  interface RegionModel {
    getDelegations: HasManyGetAssociationsMixin<DelegationModel>;
    setDelegations: HasManySetAssociationsMixin<DelegationModel, number>;
    delegations?: DelegationModel[];
  }

  interface DelegationModel {
    getRegion: BelongsToGetAssociationMixin<RegionModel>;
    setRegion: BelongsToSetAssociationMixin<RegionModel, number>;
    region?: RegionModel;
    
    getAgences: HasManyGetAssociationsMixin<AgenceModel>;
    setAgences: HasManySetAssociationsMixin<AgenceModel, number>;
    agences?: AgenceModel[];
  }

  interface AgenceModel {
    getDelegation: BelongsToGetAssociationMixin<DelegationModel>;
    setDelegation: BelongsToSetAssociationMixin<DelegationModel, number>;
    delegation?: DelegationModel;
  }

  interface AssistanceRequestModel {
    getFiles: HasManyGetAssociationsMixin<AssistanceFileModel>;
    setFiles: HasManySetAssociationsMixin<AssistanceFileModel, number>;
    files?: AssistanceFileModel[];
    
    getHistory: HasManyGetAssociationsMixin<AssistanceHistoryModel>;
    setHistory: HasManySetAssociationsMixin<AssistanceHistoryModel, number>;
    history?: AssistanceHistoryModel[];
    
    getRequester: BelongsToGetAssociationMixin<UserModel>;
    setRequester: BelongsToSetAssociationMixin<UserModel, number>;
    requester?: UserModel;
    
    getDelegue: BelongsToGetAssociationMixin<UserModel>;
    setDelegue: BelongsToSetAssociationMixin<UserModel, number>;
    delegue?: UserModel;
    
    getBusiness: BelongsToGetAssociationMixin<UserModel>;
    setBusiness: BelongsToSetAssociationMixin<UserModel, number>;
    business?: UserModel;
    
    getAgence: BelongsToGetAssociationMixin<AgenceModel>;
    setAgence: BelongsToSetAssociationMixin<AgenceModel, number>;
    agence?: AgenceModel;
  }

  interface AssistanceFileModel {
    getRequest: BelongsToGetAssociationMixin<AssistanceRequestModel>;
    setRequest: BelongsToSetAssociationMixin<AssistanceRequestModel, number>;
    request?: AssistanceRequestModel;
  }

  interface AssistanceHistoryModel {
    getRequest: BelongsToGetAssociationMixin<AssistanceRequestModel>;
    setRequest: BelongsToSetAssociationMixin<AssistanceRequestModel, number>;
    request?: AssistanceRequestModel;
  }

  interface UserModel {
    getSessions: HasManyGetAssociationsMixin<SessionModel>;
    setSessions: HasManySetAssociationsMixin<SessionModel, number>;
    sessions?: SessionModel[];
    
    getVerificationCodes: HasManyGetAssociationsMixin<VerificationCodeModel>;
    setVerificationCodes: HasManySetAssociationsMixin<VerificationCodeModel, number>;
    verificationCodes?: VerificationCodeModel[];
    
    getRoles: BelongsToManyGetAssociationsMixin<RoleModel>;
    setRoles: BelongsToManySetAssociationsMixin<RoleModel, number>;
    roles?: RoleModel[];
    
    getAssistanceRequests: HasManyGetAssociationsMixin<AssistanceRequestModel>;
    setAssistanceRequests: HasManySetAssociationsMixin<AssistanceRequestModel, number>;
    assistanceRequests?: AssistanceRequestModel[];
  }

  interface SessionModel {
    getUser: BelongsToGetAssociationMixin<UserModel>;
    setUser: BelongsToSetAssociationMixin<UserModel, number>;
    user?: UserModel;
  }

  interface VerificationCodeModel {
    getUser: BelongsToGetAssociationMixin<UserModel>;
    setUser: BelongsToSetAssociationMixin<UserModel, number>;
    user?: UserModel;
  }

  interface RoleModel {
    getUsers: BelongsToManyGetAssociationsMixin<UserModel>;
    setUsers: BelongsToManySetAssociationsMixin<UserModel, number>;
    users?: UserModel[];
    
    getPermissions: BelongsToManyGetAssociationsMixin<PermissionModel>;
    setPermissions: BelongsToManySetAssociationsMixin<PermissionModel, number>;
    permissions?: PermissionModel[];
  }

  interface PermissionModel {
    getRoles: BelongsToManyGetAssociationsMixin<RoleModel>;
    setRoles: BelongsToManySetAssociationsMixin<RoleModel, number>;
    roles?: RoleModel[];
  }
}