import React from 'react';
import { 
  Home, 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, roles: ['utilisateur', 'validateur', 'administrateur'] },
    { id: 'mes-demandes', label: 'Mes demandes', icon: FileText, roles: ['utilisateur', 'verificateur', 'dec', 'bao', 'technicien', 'administrateur'] },
    { id: 'nouvelle-demande', label: 'Nouvelle demande', icon: Plus, roles: ['utilisateur', 'verificateur', 'dec', 'bao', 'technicien', 'administrateur'] },
    { id: 'a-verifier', label: 'À vérifier', icon: CheckCircle, roles: ['verificateur', 'administrateur'] },
    { id: 'a-valider-dec', label: 'À valider (DEC)', icon: CheckCircle, roles: ['dec', 'administrateur'] },
    { id: 'a-valider-bao', label: 'À valider (BAO)', icon: CheckCircle, roles: ['bao', 'administrateur'] },
    { id: 'a-assigner', label: 'À assigner', icon: Clock, roles: ['verificateur', 'administrateur'] },
    { id: 'mes-assignations', label: 'Mes assignations', icon: Clock, roles: ['technicien', 'administrateur'] },
    { id: 'en-cours', label: 'En cours', icon: Clock, roles: ['verificateur', 'dec', 'bao', 'technicien', 'administrateur'] },
    { id: 'urgentes', label: 'Urgentes', icon: AlertCircle, roles: ['verificateur', 'dec', 'bao', 'technicien', 'administrateur'] },
    { id: 'rapports', label: 'Rapports', icon: BarChart3, roles: ['administrateur'] },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: Users, roles: ['administrateur'] },
    { id: 'parametres', label: 'Paramètres', icon: Settings, roles: ['administrateur'] }
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'utilisateur')
  );

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">AssistanceApp</span>
        </div>
      </div>

      <nav className="space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Département
        </div>
        <div className="text-sm text-gray-300">
          {user?.departement}
        </div>
      </div>
    </aside>
  );
}