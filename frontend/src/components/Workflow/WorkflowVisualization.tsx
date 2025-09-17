import { CheckCircle, Clock, XCircle, User, Calendar, AlertCircle, ArrowRight, FileX } from 'lucide-react';
import { WorkflowStep, Demande } from '../../types';
import './workflow.css';

// Types pour les statuts backend réels
type AssistanceStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'TO_MODIFY' 
  | 'UNDER_VERIFICATION' 
  | 'PENDING_DELEGUE' 
  | 'PENDING_BUSINESS' 
  | 'PENDING_BOTH' 
  | 'TO_PROCESS' 
  | 'CLOSED';

interface WorkflowVisualizationProps {
  demande: Demande;
  workflow?: WorkflowStep[];
  compact?: boolean;
  showProgress?: boolean;
}

// Configuration des étapes du workflow basée sur les statuts backend
const WORKFLOW_STEPS = [
  {
    key: 'creation',
    label: 'Création',
    description: 'Demande créée en brouillon',
    statuses: ['DRAFT'],
    icon: FileX,
    order: 1
  },
  {
    key: 'submission',
    label: 'Soumission',
    description: 'Demande soumise pour vérification',
    statuses: ['SUBMITTED'],
    icon: ArrowRight,
    order: 2
  },
  {
    key: 'verification',
    label: 'Vérification',
    description: 'Vérification par le vérificateur',
    statuses: ['UNDER_VERIFICATION', 'TO_MODIFY'],
    icon: CheckCircle,
    order: 3
  },
  {
    key: 'validation_delegue',
    label: 'Validation Délégué',
    description: 'Validation par le délégué (DEC)',
    statuses: ['PENDING_DELEGUE', 'PENDING_BOTH'],
    icon: User,
    order: 4
  },
  {
    key: 'validation_business',
    label: 'Validation BAO',
    description: 'Validation par le Business Owner',
    statuses: ['PENDING_BUSINESS', 'PENDING_BOTH'],
    icon: User,
    order: 5
  },
  {
    key: 'traitement',
    label: 'Traitement',
    description: 'Prise en charge et résolution',
    statuses: ['TO_PROCESS'],
    icon: Clock,
    order: 6
  },
  {
    key: 'cloture',
    label: 'Clôture',
    description: 'Demande traitée et fermée',
    statuses: ['CLOSED'],
    icon: CheckCircle,
    order: 7
  }
];

export function WorkflowVisualization({ demande, workflow, compact = false, showProgress = true }: WorkflowVisualizationProps) {
  const currentStatus = demande.statut.toUpperCase() as AssistanceStatus;
  
  // Détermine l'état de chaque étape basé sur le statut actuel
  const getStepStatus = (step: typeof WORKFLOW_STEPS[0]) => {
    const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.statuses.includes(currentStatus));
    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.key === step.key);
    
    if (currentStatus === 'TO_MODIFY' && step.key === 'verification') {
      return 'rejected';
    }
    
    if (stepIndex < currentStepIndex) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getStatusIcon = (status: string, IconComponent: React.ComponentType<{ className?: string }>) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 workflow-icon-completed" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse dark:text-blue-400 workflow-icon-current" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 workflow-icon-rejected" />;
      case 'pending':
        return <IconComponent className="w-5 h-5 text-gray-400 dark:text-slate-500 workflow-icon-pending" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400 dark:text-slate-500 workflow-icon-pending" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/50';
      case 'current':
        return 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-700/50 dark:ring-blue-500/20';
      case 'rejected':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/50';
      case 'pending':
        return 'bg-gray-50 border-gray-200 dark:bg-slate-800/30 dark:border-slate-700/50';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-slate-800/30 dark:border-slate-700/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'current':
        return 'En cours';
      case 'rejected':
        return 'Rejeté';
      case 'pending':
        return 'En attente';
      default:
        return 'En attente';
    }
  };

  // Calcul du pourcentage de progression
  const calculateProgress = () => {
    const currentStepIndex = WORKFLOW_STEPS.findIndex(step => 
      step.statuses.includes(currentStatus)
    );
    
    if (currentStepIndex === -1) return 0;
    
    // Ajustement pour TO_MODIFY (retour en arrière)
    if (currentStatus === 'TO_MODIFY') {
      return Math.max(0, (2 / (WORKFLOW_STEPS.length - 1)) * 100); // Retour à l'étape 2
    }
    
    return Math.round((currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100);
  };

  const progress = calculateProgress();
  
  // Classe CSS basée sur le pourcentage pour éviter les styles inline
  const getProgressClass = (progressValue: number) => {
    const rounded = Math.round(progressValue / 10) * 10;
    return `progress-${Math.min(100, Math.max(0, rounded))}`;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {showProgress && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium text-blue-600">{progress}%</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1 overflow-x-auto">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step);
            const IconComponent = step.icon;
            
            return (
              <div key={step.key} className="flex items-center">
                <div 
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs whitespace-nowrap ${getStatusColor(status)}`}
                  title={`${step.label}: ${step.description}`}
                >
                  {getStatusIcon(status, IconComponent)}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`bg-blue-600 h-1.5 rounded-full progress-bar ${getProgressClass(progress)}`}
              data-progress={progress}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showProgress && (
        <div className="bg-white p-4 rounded-lg border dark:bg-slate-900/50 dark:border-slate-800 dark:backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-slate-200">Progression du workflow</h3>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-slate-800">
            <div 
              className={`bg-blue-600 h-2 rounded-full progress-bar ${getProgressClass(progress)} dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600 dark:shadow-lg dark:shadow-blue-900/20`}
              data-progress={progress}
            />
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-slate-400">
            Statut actuel: <span className="font-medium text-gray-800 dark:text-slate-300">{currentStatus.replace('_', ' ').toLowerCase()}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step);
          const IconComponent = step.icon;
          
          return (
            <div key={step.key} className="relative">
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={`absolute left-6 top-12 w-px h-8 ${
                  status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                }`} />
              )}
              
              <div className={`flex items-start space-x-4 p-4 rounded-lg border transition-all workflow-item hover:shadow-lg dark:hover:bg-slate-800/30 ${getStatusColor(status)}`}>
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(status, IconComponent)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-slate-200">
                      {step.label}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium workflow-badge ${
                      status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border dark:border-green-700' :
                      status === 'current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border dark:border-blue-700' :
                      status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border dark:border-red-700' :
                      'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-600'
                    }`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                    {step.description}
                  </p>
                  
                  {/* Affichage des informations spécifiques selon l'étape et le workflow existant */}
                  {workflow && workflow.find(w => w.etape === step.key) && (
                    <div className="space-y-2">
                      {workflow
                        .filter(w => w.etape === step.key)
                        .map(workflowStep => (
                          <div key={workflowStep.id} className="text-sm">
                            {workflowStep.assigneA && (
                              <div className="flex items-center space-x-1 text-gray-600 mb-1">
                                <User className="w-4 h-4" />
                                <span>{workflowStep.assigneA.name}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {workflowStep.dateDebut && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Début: {new Date(workflowStep.dateDebut).toLocaleDateString('fr-FR')}</span>
                                </div>
                              )}
                              {workflowStep.dateFin && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Fin: {new Date(workflowStep.dateFin).toLocaleDateString('fr-FR')}</span>
                                </div>
                              )}
                            </div>
                            
                            {workflowStep.commentaire && (
                              <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-700">
                                {workflowStep.commentaire}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* Affichage d'informations contextuelles */}
                  {status === 'current' && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Étape en cours de traitement</span>
                    </div>
                  )}
                  
                  {status === 'rejected' && step.key === 'verification' && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-red-600">
                      <XCircle className="w-3 h-3" />
                      <span>Demande retournée pour modification</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}