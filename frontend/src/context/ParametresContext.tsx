import React, { createContext, useContext, useState } from 'react';
import { Parametre, User } from '../types';
import { useAuth } from './AuthContext';

interface ParametresContextType {
  parametres: Parametre[];
  mettreAJourParametre: (id: string, valeur: string) => void;
  ajouterParametre: (parametre: Omit<Parametre, 'id' | 'modifiePar' | 'dateModification'>) => void;
  supprimerParametre: (id: string) => void;
  isLoading: boolean;
}

const ParametresContext = createContext<ParametresContextType | undefined>(undefined);

// Données de démonstration
const mockParametres: Parametre[] = [
  {
    id: '1',
    cle: 'delai_verification',
    valeur: '24',
    description: 'Délai maximum pour la vérification (en heures)',
    type: 'number',
    categorie: 'workflow',
    modifiePar: {
      id: '6',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'administrateur',
      departement: 'IT',
      telephone: '01.23.45.67.94',
      poste: 'Administrateur Système',
      dateCreation: new Date('2023-01-01'),
      actif: true
    },
    dateModification: new Date('2024-01-10')
  },
  {
    id: '2',
    cle: 'delai_validation_dec',
    valeur: '48',
    description: 'Délai maximum pour la validation DEC (en heures)',
    type: 'number',
    categorie: 'workflow',
    modifiePar: {
      id: '6',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'administrateur',
      departement: 'IT',
      telephone: '01.23.45.67.94',
      poste: 'Administrateur Système',
      dateCreation: new Date('2023-01-01'),
      actif: true
    },
    dateModification: new Date('2024-01-10')
  },
  {
    id: '3',
    cle: 'delai_validation_bao',
    valeur: '72',
    description: 'Délai maximum pour la validation BAO (en heures)',
    type: 'number',
    categorie: 'workflow',
    modifiePar: {
      id: '6',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'administrateur',
      departement: 'IT',
      telephone: '01.23.45.67.94',
      poste: 'Administrateur Système',
      dateCreation: new Date('2023-01-01'),
      actif: true
    },
    dateModification: new Date('2024-01-10')
  },
  {
    id: '4',
    cle: 'notifications_email',
    valeur: 'true',
    description: 'Activer les notifications par email',
    type: 'boolean',
    categorie: 'notifications',
    modifiePar: {
      id: '6',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'administrateur',
      departement: 'IT',
      telephone: '01.23.45.67.94',
      poste: 'Administrateur Système',
      dateCreation: new Date('2023-01-01'),
      actif: true
    },
    dateModification: new Date('2024-01-10')
  },
  {
    id: '5',
    cle: 'priorite_auto_critique',
    valeur: 'true',
    description: 'Escalade automatique en priorité critique après délai',
    type: 'boolean',
    categorie: 'workflow',
    modifiePar: {
      id: '6',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'administrateur',
      departement: 'IT',
      telephone: '01.23.45.67.94',
      poste: 'Administrateur Système',
      dateCreation: new Date('2023-01-01'),
      actif: true
    },
    dateModification: new Date('2024-01-10')
  },
  {
    id: '6',
    cle: 'langue_defaut',
    valeur: 'fr',
    description: 'Langue par défaut de l\'application',
    type: 'select',
    options: ['fr', 'en', 'es'],
    categorie: 'general',
    modifiePar: {
      id: '6',
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@company.com',
      role: 'administrateur',
      departement: 'IT',
      telephone: '01.23.45.67.94',
      poste: 'Administrateur Système',
      dateCreation: new Date('2023-01-01'),
      actif: true
    },
    dateModification: new Date('2024-01-10')
  }
];

export function ParametresProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [parametres, setParametres] = useState<Parametre[]>(mockParametres);
  const [isLoading, setIsLoading] = useState(false);

  const mettreAJourParametre = (id: string, valeur: string) => {
    if (!user) return;

    setParametres(prev => prev.map(param => 
      param.id === id 
        ? { 
            ...param, 
            valeur,
            modifiePar: user,
            dateModification: new Date()
          }
        : param
    ));
  };

  const ajouterParametre = (nouveauParametre: Omit<Parametre, 'id' | 'modifiePar' | 'dateModification'>) => {
    if (!user) return;

    const parametre: Parametre = {
      ...nouveauParametre,
      id: Date.now().toString(),
      modifiePar: user,
      dateModification: new Date()
    };

    setParametres(prev => [...prev, parametre]);
  };

  const supprimerParametre = (id: string) => {
    setParametres(prev => prev.filter(param => param.id !== id));
  };

  return (
    <ParametresContext.Provider value={{
      parametres,
      mettreAJourParametre,
      ajouterParametre,
      supprimerParametre,
      isLoading
    }}>
      {children}
    </ParametresContext.Provider>
  );
}

export function useParametres() {
  const context = useContext(ParametresContext);
  if (context === undefined) {
    throw new Error('useParametres must be used within a ParametresProvider');
  }
  return context;
}