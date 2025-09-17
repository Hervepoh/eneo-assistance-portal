import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, User, Clock, FileText, X } from 'lucide-react';
import useAuth from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Demande } from '@/types';

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

// Types pour les rôles d'utilisateur
type UserRole = 'user' | 'verificateur' | 'dec' | 'bao' | 'technicien' | 'manager' | 'admin';

interface ValidationAction {
  type: 'approve' | 'reject' | 'modify' | 'assign' | 'process' | 'close';
  label: string;
  icon: React.ReactNode;
  color: string;
  requiresComment?: boolean;
  nextStatus?: AssistanceStatus;
}

interface ValidationActionsProps {
  demande: Demande;
  onStatusChange?: (newStatus: AssistanceStatus, comment?: string) => void;
  onClose?: () => void;
}

export function ValidationActions({ demande, onStatusChange, onClose }: ValidationActionsProps) {
  const { data: authResponse } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Détermine les actions disponibles selon le statut et le rôle
  const getAvailableActions = (): ValidationAction[] => {
    const currentStatus = demande.statut.toUpperCase() as AssistanceStatus;
    // Extraction sécurisée du rôle utilisateur depuis la réponse d'auth
    const user = authResponse?.data;
    const userRole = user?.roles?.[0]?.name || user?.role || 'user' as UserRole;
    
    const actions: ValidationAction[] = [];

    switch (currentStatus) {
      case 'SUBMITTED':
        if (['verificateur', 'admin'].includes(userRole)) {
          actions.push(
            {
              type: 'approve',
              label: 'Approuver et passer en vérification',
              icon: <CheckCircle className="w-4 h-4" />,
              color: 'bg-green-600 hover:bg-green-700',
              nextStatus: 'UNDER_VERIFICATION'
            },
            {
              type: 'modify',
              label: 'Demander des modifications',
              icon: <FileText className="w-4 h-4" />,
              color: 'bg-orange-600 hover:bg-orange-700',
              requiresComment: true,
              nextStatus: 'TO_MODIFY'
            }
          );
        }
        break;

      case 'UNDER_VERIFICATION':
        if (['verificateur', 'admin'].includes(userRole)) {
          actions.push(
            {
              type: 'approve',
              label: 'Valider - Envoyer au délégué',
              icon: <CheckCircle className="w-4 h-4" />,
              color: 'bg-blue-600 hover:bg-blue-700',
              nextStatus: 'PENDING_DELEGUE'
            },
            {
              type: 'reject',
              label: 'Rejeter la demande',
              icon: <XCircle className="w-4 h-4" />,
              color: 'bg-red-600 hover:bg-red-700',
              requiresComment: true,
              nextStatus: 'TO_MODIFY'
            }
          );
        }
        break;

      case 'PENDING_DELEGUE':
        if (['dec', 'admin'].includes(userRole)) {
          actions.push(
            {
              type: 'approve',
              label: 'Approuver - Envoyer au BAO',
              icon: <CheckCircle className="w-4 h-4" />,
              color: 'bg-blue-600 hover:bg-blue-700',
              nextStatus: 'PENDING_BUSINESS'
            },
            {
              type: 'reject',
              label: 'Rejeter la demande',
              icon: <XCircle className="w-4 h-4" />,
              color: 'bg-red-600 hover:bg-red-700',
              requiresComment: true,
              nextStatus: 'TO_MODIFY'
            }
          );
        }
        break;

      case 'PENDING_BUSINESS':
        if (['bao', 'admin'].includes(userRole)) {
          actions.push(
            {
              type: 'approve',
              label: 'Approuver - Prêt pour traitement',
              icon: <CheckCircle className="w-4 h-4" />,
              color: 'bg-green-600 hover:bg-green-700',
              nextStatus: 'TO_PROCESS'
            },
            {
              type: 'reject',
              label: 'Rejeter la demande',
              icon: <XCircle className="w-4 h-4" />,
              color: 'bg-red-600 hover:bg-red-700',
              requiresComment: true,
              nextStatus: 'TO_MODIFY'
            }
          );
        }
        break;

      case 'TO_PROCESS':
        if (['technicien', 'manager', 'admin'].includes(userRole)) {
          actions.push(
            {
              type: 'process',
              label: 'Prendre en charge',
              icon: <User className="w-4 h-4" />,
              color: 'bg-purple-600 hover:bg-purple-700'
            }
          );
        }
        if (['manager', 'admin'].includes(userRole)) {
          actions.push(
            {
              type: 'assign',
              label: 'Assigner à un technicien',
              icon: <User className="w-4 h-4" />,
              color: 'bg-indigo-600 hover:bg-indigo-700'
            }
          );
        }
        break;

      default:
        break;
    }

    return actions;
  };

  const handleAction = async (action: ValidationAction) => {
    if (action.requiresComment && !comment.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire pour cette action.",
        variant: "destructive"
      });
      setShowCommentInput(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Ici vous pourriez appeler votre API pour mettre à jour le statut
      if (action.nextStatus) {
        onStatusChange?.(action.nextStatus, comment);
      }
      
      toast({
        title: "Action effectuée",
        description: `La demande a été ${action.label.toLowerCase()}.`,
        variant: "default"
      });
      
      setComment('');
      setShowCommentInput(false);
      onClose?.();
      
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'action.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const availableActions = getAvailableActions();
  const currentStatus = demande.statut.toUpperCase() as AssistanceStatus;

  if (availableActions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center dark:bg-slate-800/50 dark:border-slate-700">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 dark:text-slate-500" />
        <p className="text-gray-600 dark:text-slate-400">Aucune action disponible pour cette demande</p>
        <p className="text-sm text-gray-500 mt-1 dark:text-slate-500">
          Statut actuel: {currentStatus.replace('_', ' ').toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 dark:bg-slate-900/50 dark:border-slate-700 dark:backdrop-blur-sm">
      <div className="border-b pb-4 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200">
          Actions de validation
        </h3>
        <p className="text-sm text-gray-600 mt-1 dark:text-slate-400">
          Statut actuel: <span className="font-medium text-gray-800 dark:text-slate-300">{currentStatus.replace('_', ' ').toLowerCase()}</span>
        </p>
      </div>

      {/* Zone de commentaire */}
      {(showCommentInput || availableActions.some(a => a.requiresComment)) && (
        <div className="space-y-2">
          <label htmlFor="validation-comment" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Commentaire {availableActions.some(a => a.requiresComment) ? '(requis)' : '(optionnel)'}
          </label>
          <textarea
            id="validation-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-enhanced dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            placeholder="Ajoutez votre commentaire ou justification..."
          />
        </div>
      )}

      {/* Actions disponibles */}
      <div className="space-y-3">
        {availableActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action)}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none focus-enhanced ${action.color} ${
              action.type === 'approve' ? 'btn-success dark:shadow-green-900/20' :
              action.type === 'reject' ? 'btn-danger dark:shadow-red-900/20' :
              action.type === 'process' ? 'btn-primary dark:shadow-blue-900/20' :
              'btn-secondary'
            }`}
          >
            {action.icon}
            <span className="font-medium">{action.label}</span>
            {isProcessing && <Clock className="w-4 h-4 animate-spin" />}
          </button>
        ))}
      </div>

      {/* Bouton pour afficher/masquer commentaire */}
      {!showCommentInput && !availableActions.some(a => a.requiresComment) && (
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 btn-secondary dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50 focus-enhanced"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ajouter un commentaire</span>
        </button>
      )}

      {/* Bouton de fermeture */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800/50 focus-enhanced"
        >
          <X className="w-4 h-4" />
          <span>Fermer</span>
        </button>
      )}
    </div>
  );
}