import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemandesProvider } from './context/DemandesContext';
import { ParametresProvider } from './context/ParametresContext';
import { UtilisateursProvider } from './context/UtilisateursContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { NouvelleDemande } from './components/Demandes/NouvelleDemande';
import { ListeDemandes } from './components/Demandes/ListeDemandes';
import { GestionUtilisateurs } from './components/Utilisateurs/GestionUtilisateurs';
import { GestionParametres } from './components/Parametres/GestionParametres';
import { DetailDemande } from './components/Demandes/DetailDemande';
import { Demande } from './types';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Si une demande est sélectionnée, afficher le détail
  if (selectedDemande) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <DetailDemande 
              demande={selectedDemande} 
              onBack={() => setSelectedDemande(null)} 
            />
          </main>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'nouvelle-demande':
        return <NouvelleDemande />;
      case 'mes-demandes':
        return (
          <ListeDemandes
            title="Mes demandes"
            filter={(demande) => demande.demandeur.id === user.id}
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'a-verifier':
        return (
          <ListeDemandes
            title="Demandes à vérifier"
            filter={(demande) => 
              demande.statut === 'soumise' &&
              (user.role === 'verificateur' || user.role === 'administrateur')
            }
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'a-valider-dec':
        return (
          <ListeDemandes
            title="Demandes à valider (DEC)"
            filter={(demande) => 
              demande.statut === 'validation_dec' &&
              (user.role === 'dec' || user.role === 'administrateur')
            }
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'a-valider-bao':
        return (
          <ListeDemandes
            title="Demandes à valider (BAO)"
            filter={(demande) => 
              demande.statut === 'validation_bao' &&
              (user.role === 'bao' || user.role === 'administrateur')
            }
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'a-assigner':
        return (
          <ListeDemandes
            title="Demandes à assigner"
            filter={(demande) => 
              demande.statut === 'approuvee' &&
              (user.role === 'verificateur' || user.role === 'administrateur')
            }
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'mes-assignations':
        return (
          <ListeDemandes
            title="Mes assignations"
            filter={(demande) => 
              demande.technicien?.id === user.id &&
              ['assignee', 'en_cours'].includes(demande.statut)
            }
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'en-cours':
        return (
          <ListeDemandes
            title="Demandes en cours"
            filter={(demande) => demande.statut === 'en_cours'}
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'urgentes':
        return (
          <ListeDemandes
            title="Demandes urgentes"
            filter={(demande) => demande.priorite === 'haute' || demande.priorite === 'critique'}
            onDemandeClick={setSelectedDemande}
          />
        );
      case 'rapports':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rapports et analyses</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600">Module de rapports en cours de développement</p>
            </div>
          </div>
        );
      case 'utilisateurs':
        return <GestionUtilisateurs />;
      case 'parametres':
        return <GestionParametres />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UtilisateursProvider>
        <ParametresProvider>
          <DemandesProvider>
            <AppContent />
          </DemandesProvider>
        </ParametresProvider>
      </UtilisateursProvider>
    </AuthProvider>
  );
}

export default App;