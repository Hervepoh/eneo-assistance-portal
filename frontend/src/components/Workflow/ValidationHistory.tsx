import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare,
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Demande } from '@/types';

interface ValidationHistoryProps {
  demande: Demande;
  compact?: boolean;
}

// Types pour les actions de validation
type ActionType = 
  | 'creation'
  | 'submission' 
  | 'verification_started'
  | 'verification_approved'
  | 'verification_rejected'
  | 'modification_requested'
  | 'delegue_approved'
  | 'delegue_rejected'
  | 'bao_approved'
  | 'bao_rejected'
  | 'assigned'
  | 'processing_started'
  | 'resolved'
  | 'closed';

const getActionInfo = (action: string) => {
  const actionMap: Record<ActionType, { 
    icon: React.ReactNode; 
    color: string; 
    bgColor: string;
    label: string;
  }> = {
    creation: {
      icon: <FileText className="w-4 h-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Création'
    },
    submission: {
      icon: <ArrowRight className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Soumission'
    },
    verification_started: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Vérification démarrée'
    },
    verification_approved: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Vérification approuvée'
    },
    verification_rejected: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Vérification rejetée'
    },
    modification_requested: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Modification demandée'
    },
    delegue_approved: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Validé par le DEC'
    },
    delegue_rejected: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Rejeté par le DEC'
    },
    bao_approved: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Validé par le BAO'
    },
    bao_rejected: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Rejeté par le BAO'
    },
    assigned: {
      icon: <User className="w-4 h-4" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      label: 'Assigné'
    },
    processing_started: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Traitement démarré'
    },
    resolved: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Résolu'
    },
    closed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Fermé'
    }
  };

  return actionMap[action as ActionType] || {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: action
  };
};

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function ValidationHistory({ demande, compact = false }: ValidationHistoryProps) {
  // Utiliser uniquement l'historique réel de la demande
  const history = demande.historique || [];

  // Si aucun historique n'est disponible, afficher un message
  if (history.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center dark:bg-slate-800/50 dark:border-slate-700">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 dark:text-slate-500" />
        <p className="text-gray-600 dark:text-slate-400">Aucun historique disponible</p>
        <p className="text-sm text-gray-500 mt-1 dark:text-slate-500">
          L'historique sera disponible une fois que des actions auront été effectuées sur cette demande.
        </p>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Historique ({history.length} actions)
        </h4>
        <div className="space-y-1">
          {sortedHistory.slice(0, 3).map((action) => {
            const actionInfo = getActionInfo(action.action);
            return (
              <div key={action.id} className="flex items-center space-x-2 text-xs">
                <div className={`p-1 rounded ${actionInfo.bgColor}`}>
                  <div className={actionInfo.color}>
                    {actionInfo.icon}
                  </div>
                </div>
                <span className="font-medium">{actionInfo.label}</span>
                <span className="text-gray-500">
                  {formatDate(action.date)}
                </span>
              </div>
            );
          })}
          {history.length > 3 && (
            <div className="text-xs text-gray-500 italic">
              ... et {history.length - 3} autres actions
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Clock className="w-5 h-5 mr-2" />
          Historique des validations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHistory.map((action, index) => {
            const actionInfo = getActionInfo(action.action);
            const isLatest = index === 0;
            
            return (
              <div key={action.id} className="relative">
                {/* Ligne de connexion */}
                {index < sortedHistory.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-8 bg-gray-300" />
                )}
                
                <div className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                }`}>
                  {/* Icône d'action */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${actionInfo.bgColor}`}>
                    <div className={actionInfo.color}>
                      {actionInfo.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* En-tête de l'action */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {actionInfo.label}
                      </h4>
                      {isLatest && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          Dernière action
                        </Badge>
                      )}
                    </div>
                    
                    {/* Informations sur l'auteur et la date */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{action.auteur.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(action.date)}</span>
                      </div>
                      {action.etapeWorkflow && (
                        <Badge variant="secondary" className="text-xs">
                          {action.etapeWorkflow}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Détails de l'action */}
                    {action.details && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{action.details}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Résumé du délai */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-900">Temps total</div>
              <div className="text-gray-600">
                {Math.ceil((new Date().getTime() - new Date(demande.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Étapes complétées</div>
              <div className="text-gray-600">
                {history.filter(h => h.action.includes('approved')).length} / {history.length}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Statut actuel</div>
              <div className="text-gray-600">
                {demande.statut.replace('_', ' ').toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}