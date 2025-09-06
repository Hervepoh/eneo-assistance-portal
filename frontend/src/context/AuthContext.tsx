import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données de démonstration
const mockUsers: User[] = [
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
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie.martin@company.com',
    role: 'administrateur',
    departement: 'IT',
    telephone: '01.23.45.67.94',
    poste: 'Administrateur Système',
    dateCreation: new Date('2023-01-01'),
    actif: true
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler la vérification de l'authentification existante
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation d'une API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}