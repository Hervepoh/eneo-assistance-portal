# Guide d'intégration - Composants de Vérification et Validation

Ce guide détaille l'utilisation des composants améliorés pour la vérification et validation des demandes d'assistance.

## 📋 Vue d'ensemble

Les composants de validation ont été entièrement refactorisés pour respecter la logique métier backend et offrir une expérience utilisateur optimale selon les rôles.

### 🔧 Composants principaux

1. **ValidationActions** - Actions de validation contextuelles
2. **WorkflowVisualization** - Visualisation du workflow avec progression
3. **ValidationHistory** - Historique détaillé des validations
4. **Pages spécialisées** - Interfaces dédiées par rôle

## 🚀 ValidationActions

### Utilisation

```tsx
import { ValidationActions } from "@/components/Workflow/ValidationActions";

<ValidationActions
  demande={demandeObject}
  onStatusChange={(newStatus, comment) => {
    // Gérer le changement de statut
    console.log("Nouveau statut:", newStatus, "Commentaire:", comment);
  }}
  onClose={() => setShowActions(false)}
/>;
```

### Fonctionnalités

- **Logique métier intégrée** : Actions basées sur le statut actuel et le rôle utilisateur
- **Statuts backend réels** : Compatible avec les énumérations backend (DRAFT, SUBMITTED, etc.)
- **Validation des permissions** : Affichage conditionnel selon les rôles
- **Gestion des commentaires** : Commentaires obligatoires pour certaines actions
- **Feedback utilisateur** : Notifications toast intégrées

### Statuts supportés

```typescript
type AssistanceStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "TO_MODIFY"
  | "UNDER_VERIFICATION"
  | "PENDING_DELEGUE"
  | "PENDING_BUSINESS"
  | "PENDING_BOTH"
  | "TO_PROCESS"
  | "CLOSED";
```

### Actions par rôle

- **Vérificateur** : Approuver/Rejeter les demandes SUBMITTED et UNDER_VERIFICATION
- **DEC** : Valider les demandes PENDING_DELEGUE
- **BAO** : Valider les demandes PENDING_BUSINESS
- **Technicien** : Prendre en charge les demandes TO_PROCESS
- **Manager** : Assigner des techniciens

## 📊 WorkflowVisualization

### Utilisation

```tsx
import { WorkflowVisualization } from '@/components/Workflow/WorkflowVisualization';

// Mode compact
<WorkflowVisualization
  demande={demandeObject}
  compact={true}
  showProgress={true}
/>

// Mode détaillé
<WorkflowVisualization
  demande={demandeObject}
  workflow={workflowSteps} // Optionnel
  compact={false}
  showProgress={true}
/>
```

### Fonctionnalités

- **Progression automatique** : Calcul du pourcentage basé sur le statut
- **Statuts visuels** : Icônes et couleurs contextuelles
- **Mode responsive** : Compact pour mobile, détaillé pour desktop
- **Étapes configurables** : Basées sur la logique métier réelle
- **Support des retours** : Gestion du statut TO_MODIFY

### Configuration des étapes

Les étapes sont automatiquement déterminées selon les statuts backend :

1. **Création** (DRAFT)
2. **Soumission** (SUBMITTED)
3. **Vérification** (UNDER_VERIFICATION, TO_MODIFY)
4. **Validation Délégué** (PENDING_DELEGUE)
5. **Validation BAO** (PENDING_BUSINESS)
6. **Traitement** (TO_PROCESS)
7. **Clôture** (CLOSED)

## 📚 ValidationHistory

### Utilisation

```tsx
import { ValidationHistory } from '@/components/Workflow/ValidationHistory';

// Mode compact
<ValidationHistory
  demande={demandeObject}
  compact={true}
/>

// Mode détaillé
<ValidationHistory
  demande={demandeObject}
  compact={false}
/>
```

### Fonctionnalités

- **Historique chronologique** : Actions triées par date
- **Types d'actions** : Icônes et couleurs spécifiques
- **Informations contextuelles** : Auteur, date, commentaires
- **Résumé des métriques** : Temps total, étapes complétées
- **Mode compact** : Vue résumée pour les listes

## 🎯 Pages spécialisées

### RequestsToVerify

Interface dédiée aux vérificateurs avec :

- Tableau de bord des statistiques
- Instructions de vérification
- Filtrage par priorité
- Badge de rôle

### RequestsToDec

Interface pour les délégués (DEC) avec :

- Métriques de validation
- Alertes pour demandes en attente
- Suivi des performances
- Responsabilités DEC

### RequestsToBao

Interface pour les Business Owners avec :

- KPI business
- Répartition par priorité
- SLA et délais
- Métriques d'impact

## 🔗 Intégration avec l'existant

### Props compatibles

Les composants respectent les interfaces existantes :

```typescript
interface Demande {
  id: number;
  statut: string; // Compatible avec les statuts backend
  requestor: User;
  verificateur?: User;
  // ... autres propriétés existantes
}
```

### Hooks utilisés

- `useAuth()` : Authentification et rôles utilisateur
- `useToast()` : Notifications utilisateur
- API calls existantes pour les mises à jour de statut

## 📱 Responsive Design

Tous les composants sont optimisés pour :

- **Mobile** : Mode compact, interfaces simplifiées
- **Tablet** : Grilles adaptatives
- **Desktop** : Vues détaillées complètes

## 🎨 Styles et thèmes

Les composants utilisent :

- **Tailwind CSS** : Classes utilitaires
- **Shadcn/ui** : Composants de base (Card, Badge, etc.)
- **Lucide React** : Icônes cohérentes
- **Design tokens** : Couleurs et espacements standardisés

## ⚙️ Configuration requise

### Dépendances

```json
{
  "@/components/ui/card": "shadcn/ui",
  "@/components/ui/badge": "shadcn/ui",
  "@/hooks/use-auth": "hook d'authentification",
  "@/hooks/use-toast": "hook de notifications",
  "lucide-react": "icônes",
  "@/types": "types TypeScript"
}
```

### Types requis

```typescript
// Dans types/index.ts
export interface ValidationActions {
  onStatusChange?: (newStatus: string, comment?: string) => void;
}

export interface WorkflowVisualizationProps {
  demande: Demande;
  compact?: boolean;
  showProgress?: boolean;
}
```

## 🚦 Flux de validation

### 1. Soumission initiale

```
DRAFT → SUBMITTED (par le demandeur)
```

### 2. Vérification

```
SUBMITTED → UNDER_VERIFICATION → PENDING_DELEGUE (approuvé)
SUBMITTED → UNDER_VERIFICATION → TO_MODIFY (rejeté)
```

### 3. Validation DEC

```
PENDING_DELEGUE → PENDING_BUSINESS (approuvé)
PENDING_DELEGUE → TO_MODIFY (rejeté)
```

### 4. Validation BAO

```
PENDING_BUSINESS → TO_PROCESS (approuvé)
PENDING_BUSINESS → TO_MODIFY (rejeté)
```

### 5. Traitement

```
TO_PROCESS → CLOSED (résolu)
```

## 📝 Exemples d'utilisation

### Page de détail de demande

```tsx
function DemandeDetail({ demande }: { demande: Demande }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="space-y-6">
      {/* Informations de la demande */}
      <DemandeInfo demande={demande} />

      {/* Visualisation du workflow */}
      <WorkflowVisualization
        demande={demande}
        compact={false}
        showProgress={true}
      />

      {/* Actions de validation */}
      {showActions && (
        <ValidationActions
          demande={demande}
          onStatusChange={(newStatus, comment) => {
            updateDemandeStatus(demande.id, newStatus, comment);
            setShowActions(false);
          }}
          onClose={() => setShowActions(false)}
        />
      )}

      {/* Historique */}
      <ValidationHistory demande={demande} compact={false} />
    </div>
  );
}
```

### Liste avec actions rapides

```tsx
function DemandeList({ demandes }: { demandes: Demande[] }) {
  return (
    <div className="space-y-4">
      {demandes.map((demande) => (
        <Card key={demande.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3>{demande.titre}</h3>
                <WorkflowVisualization demande={demande} compact={true} />
                <ValidationHistory demande={demande} compact={true} />
              </div>
              <ValidationActions
                demande={demande}
                onStatusChange={handleStatusChange}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 🔧 Personnalisation

### Couleurs par statut

```typescript
const STATUS_COLORS = {
  DRAFT: "gray",
  SUBMITTED: "blue",
  UNDER_VERIFICATION: "orange",
  PENDING_DELEGUE: "purple",
  PENDING_BUSINESS: "yellow",
  TO_PROCESS: "indigo",
  CLOSED: "green",
};
```

### Actions personnalisées

```typescript
const CUSTOM_ACTIONS = {
  'custom_action': {
    label: 'Action personnalisée',
    icon: <CustomIcon />,
    color: 'bg-custom-600',
    requiresComment: true
  }
};
```

## 🚀 Prochaines étapes

1. **Tests unitaires** : Ajouter des tests pour chaque composant
2. **Intégration API** : Connecter aux endpoints backend réels
3. **Optimisations** : Améliorer les performances avec React.memo
4. **Accessibilité** : Ajouter les attributs ARIA nécessaires
5. **Documentation Storybook** : Créer des stories pour chaque composant

## 📞 Support

Pour toute question ou problème d'intégration :

- Consulter les types TypeScript pour les interfaces
- Vérifier les props requises dans chaque composant
- Tester en mode développement avec des données mockées
- Utiliser les exemples fournis comme point de départ
