import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';

interface UtilisateursContextType {
  utilisateurs: User[];
  ajouterUtilisateur: (utilisateur: Omit<User, 'id' | 'dateCreation'>) => void;
  mettreAJourUtilisateur: (id: string, updates: Partial<User>) => void;
  supprimerUtilisateur: (id: string) => void;
  activerDesactiverUtilisateur: (id: string, actif: boolean) => void;
  isLoading: boolean;
}

const UtilisateursContext = createContext<UtilisateursContextType | undefined>(undefined);

// Données de démonstration étendues
const mockUtilisateurs: User[] = [
  {
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
  {
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
  {
    id: '3',
    nom: 'Durand',
    prenom: 'Pierre',
    email: 'pierre.durand@company.com',
    role: 'dec',
    departement: 'Direction',
    telephone: '01.23.45.67.91',
    poste: 'Directeur Exécutif',
    dateCreation: new Date('2023-01-05'),
    actif: true
  },
  {
    id: '4',
    nom: 'Moreau',
    prenom: 'Marie',
    email: 'marie.moreau@company.com',
    role: 'bao',
    departement: 'Finance',
    telephone: '01.23.45.67.92',
    poste: 'Responsable Budget',
    dateCreation: new Date('2023-01-08'),
    actif: true
  },
  {
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
  {
    id: '6',
    nom: 'Bernard',
    prenom: 'Claire',
    email: 'claire.bernard@company.com',
    role: 'administrateur',
    departement: 'IT',
    telephone: '01.23.45.67.94',
    poste: 'Administrateur Système',
    dateCreation: new Date('2023-01-01'),
    actif: true
  },
  {
    id: '7',
    nom: 'Rousseau',
    prenom: 'Marc',
    email: 'marc.rousseau@company.com',
    role: 'utilisateur',
    departement: 'Marketing',
    telephone: '01.23.45.67.95',
    poste: 'Chargé de communication',
    dateCreation: new Date('2023-02-01'),
    actif: true
  },
  {
    id: '8',
    nom: 'Petit',
    prenom: 'Julie',
    email: 'julie.petit@company.com',
    role: 'technicien',
    departement: 'IT',
    telephone: '01.23.45.67.96',
    poste: 'Technicienne Junior',
    dateCreation: new Date('2023-03-15'),
    actif: false
  }
];

export function UtilisateursProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<User[]>(mockUtilisateurs);
  const [isLoading, setIsLoading] = useState(false);

  const ajouterUtilisateur = (nouvelUtilisateur: Omit<User, 'id' | 'dateCreation'>) => {
    const utilisateur: User = {
      ...nouvelUtilisateur,
      id: Date.now().toString(),
      dateCreation: new Date()
    };

    setUtilisateurs(prev => [...prev, utilisateur]);
  };

  const mettreAJourUtilisateur = (id: string, updates: Partial<User>) => {
    setUtilisateurs(prev => prev.map(utilisateur => 
      utilisateur.id === id 
        ? { ...utilisateur, ...updates }
        : utilisateur
    ));
  };

  const supprimerUtilisateur = (id: string) => {
    setUtilisateurs(prev => prev.filter(utilisateur => utilisateur.id !== id));
  };

  const activerDesactiverUtilisateur = (id: string, actif: boolean) => {
    setUtilisateurs(prev => prev.map(utilisateur => 
      utilisateur.id === id 
        ? { ...utilisateur, actif }
        : utilisateur
    ));
  };

  return (
    <UtilisateursContext.Provider value={{
      utilisateurs,
      ajouterUtilisateur,
      mettreAJourUtilisateur,
      supprimerUtilisateur,
      activerDesactiverUtilisateur,
      isLoading
    }}>
      {children}
    </UtilisateursContext.Provider>
  );
}

export function useUtilisateurs() {
  const context = useContext(UtilisateursContext);
  if (context === undefined) {
    throw new Error('useUtilisateurs must be used within a UtilisateursProvider');
  }
  return context;
}