import { CheckCircle, Clock, XCircle, User, Calendar } from 'lucide-react';
import { WorkflowStep } from '../../types';

interface WorkflowVisualizationProps {
  workflow: WorkflowStep[];
  compact?: boolean;
}

export function WorkflowVisualization({ workflow, compact = false }: WorkflowVisualizationProps) {
  const getEtapeLabel = (etape: string) => {
    const labels = {
      verification: 'Vérification',
      validation_dec: 'Validation DEC',
      validation_bao: 'Validation BAO',
      assignation: 'Assignation',
      resolution: 'Résolution'
    };
    return labels[etape as keyof typeof labels] || etape;
  };

  const getStatutIcon = (statut: WorkflowStep['statut']) => {
    switch (statut) {
      case 'termine':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_cours':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'rejete':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatutColor = (statut: WorkflowStep['statut']) => {
    switch (statut) {
      case 'termine':
        return 'bg-green-50 border-green-200';
      case 'en_cours':
        return 'bg-blue-50 border-blue-200';
      case 'rejete':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const sortedWorkflow = [...workflow].sort((a, b) => a.ordre - b.ordre);

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {sortedWorkflow.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatutColor(step.statut)}`}>
              {getStatutIcon(step.statut)}
              <span>{getEtapeLabel(step.etape)}</span>
            </div>
            {index < sortedWorkflow.length - 1 && (
              <div className="w-4 h-px bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedWorkflow.map((step, index) => (
        <div key={step.id} className="relative">
          {index < sortedWorkflow.length - 1 && (
            <div className="absolute left-6 top-12 w-px h-8 bg-gray-300" />
          )}
          
          <div className={`flex items-start space-x-4 p-4 rounded-lg border ${getStatutColor(step.statut)}`}>
            <div className="flex-shrink-0 mt-1">
              {getStatutIcon(step.statut)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {getEtapeLabel(step.etape)}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  step.statut === 'termine' ? 'bg-green-100 text-green-800' :
                  step.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                  step.statut === 'rejete' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {step.statut === 'termine' ? 'Terminé' :
                   step.statut === 'en_cours' ? 'En cours' :
                   step.statut === 'rejete' ? 'Rejeté' :
                   'En attente'}
                </span>
              </div>
              
              {step.assigneA && (
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span>{step.assigneA.prenom} {step.assigneA.nom}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {step.dateDebut && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Début: {new Date(step.dateDebut).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                {step.dateFin && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Fin: {new Date(step.dateFin).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
              
              {step.commentaire && (
                <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-700">
                  {step.commentaire}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}