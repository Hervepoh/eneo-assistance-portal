import React, { createContext, useContext, useState, useEffect } from 'react';
import { Demande, User, Statistiques, WorkflowStep } from '../types';
import { useAuth } from './AuthContext';

interface DemandesContextType {
  demandes: Demande[];
  statistiques: Statistiques;
  creerDemande: (demande: Omit<Demande, 'id' | 'demandeur' | 'dateCreation' | 'dateModification' | 'commentaires' | 'historique'>) => void;
  mettreAJourDemande: (id: string, updates: Partial<Demande>) => void;
  ajouterCommentaire: (demandeId: string, contenu: string, prive?: boolean) => void;
  validerEtape: (demandeId: string, etape: string, approuve: boolean, commentaire?: string) => void;
  assignerTechnicien: (demandeId: string, technicien: User) => void;
  demarrerResolution: (demandeId: string) => void;
  terminerResolution: (demandeId: string, commentaire?: string) => void;
  isLoading: boolean;
}

const DemandesContext = createContext<DemandesContextType | undefined>(undefined);

// Données de démonstration
const mockDemandes: Demande[] = [
  {
    id: '1',
    titre: 'Problème de connexion réseau',
    description: 'Impossible de me connecter au réseau interne depuis ce matin.',
    categorie: 'technique',
    priorite: 'haute',
    statut: 'en_cours',
    demandeur: {
      id: '1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@company.com',
      role: 'utilisateur',
      departement: 'IT',
      telephone: '01.23.45.67.89',
      poste: 'Développeur',
      dateCreation: new Date('2023-01-15'),
      actif: true
    },
    verificateur: {
      id: '2',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'verificateur',
      departement: 'IT',
      telephone: '01.23.45.67.90',
      poste: 'Chef de projet',
      dateCreation: new Date('2023-01-10'),
      actif: true
    },
    technicien: {
      id: '5',
      nom: 'Leroy',
      prenom: 'Thomas',
      email: 'thomas.leroy@company.com',
      role: 'technicien',
      departement: 'IT',
      telephone: '01.23.45.67.93',
      poste: 'Technicien Senior',
      dateCreation: new Date('2023-01-12'),
      actif: true
    },
    dateCreation: new Date('2024-01-15T09:00:00'),
    dateModification: new Date('2024-01-15T14:30:00'),
    dateEcheance: new Date('2024-01-17T17:00:00'),
    dateVerification: new Date('2024-01-15T10:00:00'),
    dateAssignation: new Date('2024-01-15T11:00:00'),
    fichiers: [],
    workflow: [
      {
        id: '1',
        etape: 'verification',
        statut: 'termine',
        assigneA: {
          id: '2',
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@company.com',
          role: 'verificateur',
          departement: 'IT',
          telephone: '01.23.45.67.90',
          poste: 'Chef de projet',
          dateCreation: new Date('2023-01-10'),
          actif: true
        },
        dateDebut: new Date('2024-01-15T09:30:00'),
        dateFin: new Date('2024-01-15T10:00:00'),
        commentaire: 'Demande vérifiée et approuvée',
        ordre: 1
      },
      {
        id: '2',
        etape: 'assignation',
        statut: 'termine',
        assigneA: {
          id: '5',
          nom: 'Leroy',
          prenom: 'Thomas',
          email: 'thomas.leroy@company.com',
          role: 'technicien',
          departement: 'IT',
          telephone: '01.23.45.67.93',
          poste: 'Technicien Senior',
          dateCreation: new Date('2023-01-12'),
          actif: true
        },
        dateDebut: new Date('2024-01-15T10:30:00'),
        dateFin: new Date('2024-01-15T11:00:00'),
        commentaire: 'Assigné au technicien',
        ordre: 2
      },
      {
        id: '3',
        etape: 'resolution',
        statut: 'en_cours',
        assigneA: {
          id: '5',
          nom: 'Leroy',
          prenom: 'Thomas',
          email: 'thomas.leroy@company.com',
          role: 'technicien',
          departement: 'IT',
          telephone: '01.23.45.67.93',
          poste: 'Technicien Senior',
          dateCreation: new Date('2023-01-12'),
          actif: true
        },
        dateDebut: new Date('2024-01-15T11:00:00'),
        ordre: 3
      }
    ],
    commentaires: [
      {
        id: '1',
        auteur: {
          id: '2',
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@company.com',
          role: 'verificateur',
          departement: 'IT',
          telephone: '01.23.45.67.90',
          poste: 'Chef de projet',
          dateCreation: new Date('2023-01-10'),
          actif: true
        },
        contenu: 'Demande prise en compte, notre équipe technique va intervenir rapidement.',
        dateCreation: new Date('2024-01-15T10:30:00'),
        prive: false,
        type: 'validation'
      }
    ],
    historique: [
      {
        id: '1',
        action: 'Demande créée',
        auteur: {
          id: '1',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@company.com',
          role: 'utilisateur',
          departement: 'IT',
          telephone: '01.23.45.67.89',
          poste: 'Développeur',
          dateCreation: new Date('2023-01-15'),
          actif: true
        },
        date: new Date('2024-01-15T09:00:00'),
        etapeWorkflow: 'creation'
      },
      {
        id: '2',
        action: 'Demande vérifiée et approuvée',
        auteur: {
          id: '2',
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@company.com',
          role: 'verificateur',
          departement: 'IT',
          telephone: '01.23.45.67.90',
          poste: 'Chef de projet',
          dateCreation: new Date('2023-01-10'),
          actif: true
        },
        date: new Date('2024-01-15T10:00:00'),
        etapeWorkflow: 'verification'
      },
      {
        id: '3',
        action: 'Assigné au technicien Thomas Leroy',
        auteur: {
          id: '2',
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@company.com',
          role: 'verificateur',
          departement: 'IT',
          telephone: '01.23.45.67.90',
          poste: 'Chef de projet',
          dateCreation: new Date('2023-01-10'),
          actif: true
        },
        date: new Date('2024-01-15T11:00:00'),
        etapeWorkflow: 'assignation'
      }
    ]
  }
];

export function DemandesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>(mockDemandes);
  const [isLoading, setIsLoading] = useState(false);

  const statistiques: Statistiques = {
    totalDemandes: demandes.length,
    demandesEnAttente: demandes.filter(d => ['soumise', 'verification', 'validation_dec', 'validation_bao'].includes(d.statut)).length,
    demandesEnCours: demandes.filter(d => d.statut === 'en_cours').length,
    demandesResolues: demandes.filter(d => d.statut === 'resolue' || d.statut === 'fermee').length,
    demandesParCategorie: demandes.reduce((acc, d) => {
      acc[d.categorie] = (acc[d.categorie] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    demandesParPriorite: demandes.reduce((acc, d) => {
      acc[d.priorite] = (acc[d.priorite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    demandesParStatut: demandes.reduce((acc, d) => {
      acc[d.statut] = (acc[d.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    tempsResolutionMoyen: 2.5,
    tempsValidationMoyen: 1.2,
    tauxApprobation: 85
  };

  const creerDemande = (nouvelleDemandeData: Omit<Demande, 'id' | 'demandeur' | 'dateCreation' | 'dateModification' | 'commentaires' | 'historique' | 'workflow'>) => {
    if (!user) return;

    const workflowInitial: WorkflowStep[] = [
      {
        id: Date.now().toString(),
        etape: 'verification',
        statut: 'en_attente',
        ordre: 1
      }
    ];

    // Ajouter les étapes selon la catégorie et priorité
    if (nouvelleDemandeData.categorie === 'financiere' || nouvelleDemandeData.priorite === 'critique') {
      workflowInitial.push({
        id: (Date.now() + 1).toString(),
        etape: 'validation_dec',
        statut: 'en_attente',
        ordre: 2
      });
    }

    if (nouvelleDemandeData.categorie === 'financiere') {
      workflowInitial.push({
        id: (Date.now() + 2).toString(),
        etape: 'validation_bao',
        statut: 'en_attente',
        ordre: nouvelleDemandeData.priorite === 'critique' ? 3 : 2
      });
    }

    workflowInitial.push({
      id: (Date.now() + 3).toString(),
      etape: 'assignation',
      statut: 'en_attente',
      ordre: workflowInitial.length + 1
    });

    workflowInitial.push({
      id: (Date.now() + 4).toString(),
      etape: 'resolution',
      statut: 'en_attente',
      ordre: workflowInitial.length + 1
    });

    const nouvelleDemande: Demande = {
      ...nouvelleDemandeData,
      id: Date.now().toString(),
      demandeur: user,
      dateCreation: new Date(),
      dateModification: new Date(),
      commentaires: [],
      workflow: workflowInitial,
      historique: [
        {
          id: Date.now().toString(),
          action: 'Demande créée',
          auteur: user,
          date: new Date(),
          etapeWorkflow: 'creation'
        }
      ]
    };

    setDemandes(prev => [nouvelleDemande, ...prev]);
  };

  const mettreAJourDemande = (id: string, updates: Partial<Demande>) => {
    setDemandes(prev => prev.map(demande => 
      demande.id === id 
        ? { 
            ...demande, 
            ...updates, 
            dateModification: new Date(),
            historique: [
              ...demande.historique,
              {
                id: Date.now().toString(),
                action: 'Demande modifiée',
                auteur: user!,
                date: new Date(),
                details: Object.keys(updates).join(', '),
                etapeWorkflow: 'modification'
              }
            ]
          }
        : demande
    ));
  };

  const ajouterCommentaire = (demandeId: string, contenu: string, prive = false) => {
    if (!user) return;

    const nouveauCommentaire = {
      id: Date.now().toString(),
      auteur: user,
      contenu,
      dateCreation: new Date(),
      prive,
      type: 'commentaire'
    };

    setDemandes(prev => prev.map(demande => 
      demande.id === demandeId
        ? {
            ...demande,
            commentaires: [...demande.commentaires, nouveauCommentaire],
            dateModification: new Date(),
            historique: [
              ...demande.historique,
              {
                id: Date.now().toString(),
                action: 'Commentaire ajouté',
                auteur: user,
                date: new Date(),
                etapeWorkflow: 'commentaire'
              }
            ]
          }
        : demande
    ));
  };

  const validerEtape = (demandeId: string, etape: string, approuve: boolean, commentaire?: string) => {
    if (!user) return;

    setDemandes(prev => prev.map(demande => {
      if (demande.id !== demandeId) return demande;

      const workflowMisAJour = demande.workflow.map(step => {
        if (step.etape === etape && step.statut === 'en_attente') {
          return {
            ...step,
            statut: approuve ? 'termine' : 'rejete' as const,
            assigneA: user,
            dateDebut: step.dateDebut || new Date(),
            dateFin: new Date(),
            commentaire
          };
        }
        return step;
      });

      // Déterminer le nouveau statut
      let nouveauStatut = demande.statut;
      if (!approuve) {
        nouveauStatut = 'rejetee';
      } else {
        const prochainEtape = workflowMisAJour.find(step => step.statut === 'en_attente');
        if (prochainEtape) {
          switch (prochainEtape.etape) {
            case 'verification':
              nouveauStatut = 'verification';
              break;
            case 'validation_dec':
              nouveauStatut = 'validation_dec';
              break;
            case 'validation_bao':
              nouveauStatut = 'validation_bao';
              break;
            case 'assignation':
              nouveauStatut = 'approuvee';
              break;
            case 'resolution':
              nouveauStatut = 'assignee';
              break;
          }
        } else {
          nouveauStatut = 'resolue';
        }
      }

      return {
        ...demande,
        statut: nouveauStatut,
        workflow: workflowMisAJour,
        dateModification: new Date(),
        historique: [
          ...demande.historique,
          {
            id: Date.now().toString(),
            action: `${approuve ? 'Approuvé' : 'Rejeté'} à l'étape ${etape}`,
            auteur: user,
            date: new Date(),
            details: commentaire,
            etapeWorkflow: etape
          }
        ]
      };
    }));
  };

  const assignerTechnicien = (demandeId: string, technicien: User) => {
    if (!user) return;

    setDemandes(prev => prev.map(demande => 
      demande.id === demandeId
        ? {
            ...demande,
            technicien,
            statut: 'assignee',
            dateAssignation: new Date(),
            dateModification: new Date(),
            workflow: demande.workflow.map(step => 
              step.etape === 'assignation' 
                ? { ...step, statut: 'termine' as const, assigneA: user, dateFin: new Date() }
                : step.etape === 'resolution'
                ? { ...step, assigneA: technicien, dateDebut: new Date() }
                : step
            ),
            historique: [
              ...demande.historique,
              {
                id: Date.now().toString(),
                action: `Assigné au technicien ${technicien.prenom} ${technicien.nom}`,
                auteur: user,
                date: new Date(),
                etapeWorkflow: 'assignation'
              }
            ]
          }
        : demande
    ));
  };

  const demarrerResolution = (demandeId: string) => {
    if (!user) return;

    setDemandes(prev => prev.map(demande => 
      demande.id === demandeId
        ? {
            ...demande,
            statut: 'en_cours',
            dateModification: new Date(),
            workflow: demande.workflow.map(step => 
              step.etape === 'resolution' 
                ? { ...step, statut: 'en_cours' as const }
                : step
            ),
            historique: [
              ...demande.historique,
              {
                id: Date.now().toString(),
                action: 'Résolution démarrée',
                auteur: user,
                date: new Date(),
                etapeWorkflow: 'resolution'
              }
            ]
          }
        : demande
    ));
  };

  const terminerResolution = (demandeId: string, commentaire?: string) => {
    if (!user) return;

    setDemandes(prev => prev.map(demande => 
      demande.id === demandeId
        ? {
            ...demande,
            statut: 'resolue',
            dateResolution: new Date(),
            dateModification: new Date(),
            workflow: demande.workflow.map(step => 
              step.etape === 'resolution' 
                ? { ...step, statut: 'termine' as const, dateFin: new Date(), commentaire }
                : step
            ),
            historique: [
              ...demande.historique,
              {
                id: Date.now().toString(),
                action: 'Demande résolue',
                auteur: user,
                date: new Date(),
                details: commentaire,
                etapeWorkflow: 'resolution'
              }
            ]
          }
        : demande
    ));
  };

  return (
    <DemandesContext.Provider value={{
      demandes,
      statistiques,
      creerDemande,
      mettreAJourDemande,
      ajouterCommentaire,
      validerEtape,
      assignerTechnicien,
      demarrerResolution,
      terminerResolution,
      isLoading
    }}>
      {children}
    </DemandesContext.Provider>
  );
}

export function useDemandes() {
  const context = useContext(DemandesContext);
  if (context === undefined) {
    throw new Error('useDemandes must be used within a DemandesProvider');
  }
  return context;
}