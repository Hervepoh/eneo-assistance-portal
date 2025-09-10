export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'utilisateur' | 'verificateur' | 'dec' | 'bao' | 'technicien' | 'administrateur';
  departement: string;
  telephone?: string;
  poste?: string;
  dateCreation: Date;
  actif: boolean;
  avatar?: string;
}

export interface Demande {
  id: string;
  titre: string;
  description: string;
  categorie: 'technique' | 'administrative' | 'financiere' | 'rh' | 'autre';
  priorite: 'basse' | 'normale' | 'haute' | 'critique';
  statut: 'brouillon' | 'soumise' | 'verification' | 'validation_dec' | 'validation_bao' | 'approuvee' | 'assignee' | 'en_cours' | 'resolue' | 'fermee' | 'rejetee';
  demandeur: User;
  verificateur?: User;
  dec?: User;
  bao?: User;
  technicien?: User;
  assignePar?: User;
  dateCreation: Date;
  dateModification: Date;
  dateEcheance?: Date;
  dateVerification?: Date;
  dateValidationDec?: Date;
  dateValidationBao?: Date;
  dateAssignation?: Date;
  dateResolution?: Date;
  fichiers: string[];
  commentaires: Commentaire[];
  historique: ActionHistorique[];
  workflow: WorkflowStep[];
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