export type ModeType = 'my' | 'as-n1' | 'all'
export type ID = string | number;
export type PrioriteType = "basse" | "normale" | "haute" | "critique"


export type loginType = { email: string; password: string };

export type registerType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type verifyEmailType = { code: string };
export type forgotPasswordType = { email: string };
export type resetPasswordType = { password: string; verificationCode: string };
export type verifyMFAType = { code: string; secretKey: string };
export type mfaLoginType = { code: string; email: string };
export type SessionType = {
  _id: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export type SessionResponseType = {
  message: string;
  sessions: SessionType[];
};

export type mfaType = {
  message: string;
  secret: string;
  qrImageUrl: string;
};




// Types pour la structures organisationnelles (Agence -> Délégation -> région)
export interface Agence {
  id: ID;
  name: string;
}

export interface Delegation {
  id: ID;
  name: string;
  agences: Agence[];
}

export interface Region {
  id: ID;
  name: string;
  delegations: Delegation[];
}

// Types pour les groupes d'applications & applications
export interface Application {
  id: ID;
  name: string;
}

export interface ApplicationGroup {
  id: ID;
  name: string;
  applications: Application[];
}

// Types pour Les demandes d'assistance
export interface AssistanceFile {
  fieldname: File;
  originalname: string;
  encoding: string,
  mimetype: string,
  destination: string,
  filename: string,
  path: string,
  size: number,
}

export type AssistanceRequestPayload = {
  titre: string;
  description: string;
  regionId: ID;
  delegationId: ID;
  agenceId: ID;
  applicationGroupId: ID;
  applicationId: ID;
  priorite: PrioriteType;
  files?: AssistanceFile[];
  comments?: string[]
  status: "draft" | "submitted"; // Pour gérer le brouillon
}


export interface Demande {
  id: number;
  reference: string;
  titre: string;
  description: string;
  region: string;
  delegation: string;
  agence: string;
  application: string;
  categorie: 'technique' | 'administrative' | 'financiere' | 'rh' | 'autre';
  priorite: 'basse' | 'normale' | 'haute' | 'critique';
  statut: 'brouillon' | 'DRAFT' | 'soumise' | 'verification' | 'validation_dec' | 'validation_bao' | 'approuvee' | 'assignee' | 'en_cours' | 'resolue' | 'fermee' | 'rejetee';
  requestor: User;
  verificateur?: User;
  dec?: User;
  bao?: User;
  technicien?: User;
  assignePar?: User;
  createdAt: string;
  dateModification: string;
  dateEcheance?: Date;
  dateVerification?: Date;
  dateValidationDec?: Date;
  dateValidationBao?: Date;
  dateAssignation?: Date;
  dateResolution?: Date;
  fichiers: Fichier[];
  commentaires?: Commentaire[];
  historique?: ActionHistorique[];
  workflow?: WorkflowStep[];
}


export interface User {
  id: number;
  name: string;
  nom: string;
  prenom: string;
  email: string;
  role?: 'utilisateur' | 'verificateur' | 'dec' | 'bao' | 'technicien' | 'administrateur';
  departement?: string;
  telephone?: string;
  poste?: string;
  dateCreation?: Date;
  actif?: boolean;
  avatar?: string;
}

export interface Fichier {
  id: number;
  nom: string;
  url: string;
  type: string;
  taille: number;
}


export interface WorkflowStep {
  id: string;
  etape: 'verification' | 'validation_dec' | 'validation_bao' | 'assignation' | 'resolution';
  statut: 'en_attente' | 'en_cours' | 'termine' | 'rejete';
  assigneA?: User;
  dateDebut?: Date;
  dateFin?: Date;
  commentaire?: string;
  ordre: number;
}

export interface Commentaire {
  id: string;
  auteur: User;
  contenu: string;
  dateCreation: Date;
  prive: boolean;
  type: 'commentaire' | 'validation' | 'rejet' | 'assignation';
}

export interface ActionHistorique {
  id: string;
  action: string;
  auteur: User;
  date: Date;
  details?: string;
  etapeWorkflow?: string;
}

export interface Statistiques {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesEnCours: number;
  demandesResolues: number;
  demandesParCategorie: Record<string, number>;
  demandesParPriorite: Record<string, number>;
  demandesParStatut: Record<string, number>;
  tempsResolutionMoyen: number;
  tempsValidationMoyen: number;
  tauxApprobation: number;
}

export interface Parametre {
  id: string;
  cle: string;
  valeur: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  categorie: 'general' | 'workflow' | 'notifications' | 'securite';
  modifiePar: User;
  dateModification: Date;
}

export interface Notification {
  id: string;
  destinataire: User;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  lue: boolean;
  dateCreation: Date;
  demandeId?: string;
}

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
}