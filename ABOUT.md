# 🏢 ENEO Assistance Portal

**Portail de gestion des demandes d'assistance pour ENEO Cameroun**

Une application web complète permettant aux employés d'ENEO de créer, suivre et gérer leurs demandes d'assistance technique et administrative avec un système de workflow d'approbation multiniveau.

---

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🏗️ Architecture du Projet](#-architecture-du-projet)
- [🖥️ Frontend (React)](#-frontend-react)
- [⚙️ Backend (Node.js)](#-backend-nodejs)
- [🚀 Installation et Démarrage](#-installation-et-démarrage)
- [👤 Gestion des Utilisateurs](#-gestion-des-utilisateurs)
- [🧭 Navigation et Fonctionnalités](#-navigation-et-fonctionnalités)
- [🔐 Authentification et Sécurité](#-authentification-et-sécurité)
- [📊 Workflow des Demandes](#-workflow-des-demandes)
- [🛠️ Technologies Utilisées](#-technologies-utilisées)
- [📚 Documentation Complémentaire](#-documentation-complémentaire)

---

## 🎯 Vue d'ensemble

### Objectif

Centraliser et digitaliser le processus de demandes d'assistance au sein d'ENEO avec :

- **Création** de demandes par les employés
- **Workflow d'approbation** (Vérificateur → DEC → BAO → Technicien)
- **Suivi en temps réel** des demandes
- **Gestion des utilisateurs** et permissions
- **Authentification sécurisée** avec 2FA
- **Tableaux de bord** et statistiques

### Utilisateurs Cibles

- **Employés ENEO** : Création et suivi de demandes
- **Vérificateurs** : Validation niveau 1
- **DEC** (Directeur Exploitation Commercial) : Validation niveau 2
- **BAO** (Bureau d'Assistance et d'Orientation) : Validation niveau 3
- **Techniciens** : Traitement des demandes
- **Administrateurs** : Gestion globale du système

---

## 🏗️ Architecture du Projet

```
eneo-assistance-portal/
├── frontend/                    # Application React (Vite + TypeScript)
├── backend/                     # API REST Node.js (Express + TypeScript)
├── README.md                   # Ce fichier
├── postman_collection.json    # Collection Postman pour tester l'API
└── postman_environment.json   # Variables d'environnement Postman
```

### Stack Technique

- **Frontend** : React 18 + TypeScript + Vite + TailwindCSS
- **Backend** : Node.js + Express + TypeScript + Sequelize
- **Base de données** : MySQL
- **Authentification** : JWT + 2FA (TOTP)
- **Upload de fichiers** : Multer
- **Email** : Resend
- **State Management** : TanStack Query (React Query)

---

## 🖥️ Frontend (React)

### Structure des Dossiers

```
frontend/src/
├── components/              # Composants réutilisables
│   ├── ui/                 # Composants UI de base (shadcn/ui)
│   ├── Dashboard/          # Composants du tableau de bord
│   ├── request/            # Composants pour les demandes
│   ├── users/              # Composants gestion utilisateurs
│   ├── Workflow/           # Composants workflow
│   ├── Header.tsx          # En-tête de l'application
│   ├── Asidebar.tsx        # Menu latéral
│   ├── Sessions.tsx        # Gestion des sessions
│   └── ...
├── pages/                  # Pages de l'application
│   ├── auth/               # Pages d'authentification
│   ├── home/               # Tableau de bord principal
│   ├── requests/           # Gestion des demandes
│   ├── my-requests/        # Mes demandes
│   ├── security/           # Paramètres de sécurité
│   ├── sessions/           # Sessions actives
│   └── admin/              # Administration (en développement)
├── context/                # Contextes React
│   ├── auth-provider.tsx   # Contexte d'authentification
│   ├── query-provider.tsx  # Configuration React Query
│   └── theme-provider.tsx  # Gestion du thème
├── hooks/                  # Hooks personnalisés
│   ├── use-auth.ts         # Hook d'authentification
│   ├── use-mobile.tsx      # Détection mobile
│   └── use-toast.ts        # Notifications toast
├── layout/                 # Layouts de l'application
│   ├── AppLayout.tsx       # Layout principal (avec sidebar)
│   └── BaseLayout.tsx      # Layout de base (auth)
├── lib/                    # Utilitaires et configuration
│   ├── api.ts              # Fonctions API
│   ├── axios-client.ts     # Configuration Axios
│   └── utils.ts            # Utilitaires divers
├── routes/                 # Gestion des routes
│   ├── auth.route.tsx      # Routes protégées
│   └── public.route.tsx    # Routes publiques
├── types/                  # Types TypeScript
│   └── index.ts            # Définitions des types
└── App.tsx                 # Composant racine
```

### Composants Principaux

#### **Header.tsx**

- Affichage du nom d'utilisateur et avatar
- Menu déroulant avec liens vers profil, sécurité, sessions
- Bouton de déconnexion
- Notifications (à venir)

#### **Asidebar.tsx**

- Navigation principale de l'application
- Menu adaptatif selon les permissions utilisateur
- Liens vers : Accueil, Demandes, Mes demandes, Administration

#### **Dashboard/ (Composants)**

- Cartes de statistiques
- Graphiques et indicateurs
- Résumé des demandes en cours

#### **request/ (Composants)**

- Formulaire de création de demande
- Liste des demandes
- Détails d'une demande
- Boutons d'action (valider, rejeter, assigner)

#### **Workflow/ (Composants)**

- Visualisation du workflow
- Étapes de validation
- Historique des actions

### Pages Principales

#### **Pages d'Authentification (auth/)**

- `login.tsx` : Connexion avec email/mot de passe
- `signup.tsx` : Inscription (si activée)
- `verify-mfa.tsx` : Vérification 2FA
- `forgot-password.tsx` : Récupération de mot de passe
- `reset-password.tsx` : Réinitialisation
- `confirm-account.tsx` : Confirmation email

#### **Tableau de Bord (home/)**

- Vue d'ensemble des statistiques
- Demandes récentes
- Actions rapides
- Notifications importantes

#### **Gestion des Demandes (requests/)**

- `RequestDetail.tsx` : Détail d'une demande
- `RequestsToSuph.tsx` : Demandes à valider (Superviseur)
- `RequestsToVerify.tsx` : Demandes à vérifier
- `RequestsToDec.tsx` : Demandes pour DEC
- `RequestsToBao.tsx` : Demandes pour BAO
- `RequestsToTreat.tsx` : Demandes en traitement

#### **Mes Demandes (my-requests/)**

- Liste de toutes mes demandes
- Filtres par statut, date, priorité
- Création de nouvelle demande

#### **Sécurité (security/)**

- Activation/désactivation 2FA
- Gestion des mots de passe
- Historique de sécurité

#### **Sessions (sessions/)**

- Sessions actives
- Géolocalisation et appareils
- Révocation de sessions

### Gestion d'État

#### **AuthProvider (context/auth-provider.tsx)**

```typescript
type UserType = {
  name: string;
  email: string;
  isEmailVerified: boolean;
  userPreferences: {
    enable2FA: boolean;
  };
};

// Fournit l'état d'authentification global
const { user, isLoading, error, refetch } = useAuthContext();
```

#### **React Query (TanStack Query)**

- Cache automatique des requêtes API
- Invalidation intelligente
- Gestion des états de chargement
- Retry automatique

### Routing et Protection

#### **Routes Publiques**

- `/` : Login
- `/signup` : Inscription
- `/forgot-password` : Mot de passe oublié
- `/verify-mfa` : Vérification 2FA

#### **Routes Protégées (AuthRoute)**

- `/home` : Tableau de bord
- `/request` : Nouvelle demande
- `/my-requests` : Mes demandes
- `/requests-*` : Différentes vues selon le rôle
- `/sessions` : Gestion des sessions
- `/security` : Paramètres de sécurité

---

## ⚙️ Backend (Node.js)

### Structure des Dossiers

```
backend/src/
├── @types/                     # Définitions TypeScript globales
│   ├── index.d.ts             # Types généraux
│   └── sequelize.d.ts         # Extensions Sequelize
├── common/                     # Code partagé
│   ├── enums/                 # Énumérations
│   │   ├── assistance-status.enum.ts
│   │   ├── error-code.enum.ts
│   │   └── verification-code.enum.ts
│   ├── interface/             # Interfaces TypeScript
│   │   ├── assistance.interface.ts
│   │   ├── auth.interface.ts
│   │   └── rbac.ts
│   ├── strategies/            # Stratégies d'authentification
│   │   └── jwt.strategy.ts
│   ├── types/                 # Types personnalisés
│   ├── utils/                 # Fonctions utilitaires
│   └── validators/            # Validateurs Zod
├── config/                     # Configuration de l'application
│   ├── app.config.ts          # Configuration principale
│   └── http.config.ts         # Codes de statut HTTP
├── database/                   # Base de données
│   ├── database.ts            # Connexion Sequelize
│   ├── migrations/            # Scripts SQL
│   │   └── view.sql
│   └── models/                # Modèles Sequelize
│       ├── associations.ts    # Relations entre modèles
│       ├── user.model.ts      # Modèle utilisateur
│       ├── role.model.ts      # Modèle rôle
│       ├── assistanceRequest.model.ts
│       └── ...
├── mailers/                    # Service d'emails
│   ├── mailer.ts              # Configuration mailer
│   ├── resendClient.ts        # Client Resend
│   └── templates/             # Templates d'emails
├── middlewares/                # Middlewares Express
│   ├── auth.ts                # Authentification JWT
│   ├── errorHandler.ts        # Gestion des erreurs
│   ├── rateLimiter.ts         # Limitation de taux
│   ├── validateRequest.ts     # Validation des requêtes
│   └── multer.middleware.ts   # Upload de fichiers
├── modules/                    # Modules métier
│   ├── auth/                  # Authentification
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.validators.ts
│   ├── assistance/            # Demandes d'assistance
│   ├── user/                  # Gestion utilisateurs
│   ├── role/                  # Gestion des rôles
│   ├── permission/            # Permissions RBAC
│   ├── session/               # Sessions utilisateur
│   ├── mfa/                   # Authentification 2FA
│   ├── application/           # Applications métier ENEO
│   ├── region/                # Régions
│   ├── agence/                # Agences
│   ├── delegation/            # Délégations
│   └── references/            # Données de référence
├── scripts/                    # Scripts utilitaires
│   ├── data.application.seed.ts    # Seed applications
│   ├── data.reference.seed.ts      # Seed données référence
│   ├── user.seed.ts               # Seed utilisateurs test
│   └── clearDatabases.ts          # Nettoyage base
├── versions/                   # Versioning API
│   ├── index.ts               # Exports des versions
│   ├── v1.ts                  # Routes API v1
│   └── v2.ts                  # Routes API v2 (futur)
└── index.ts                    # Point d'entrée de l'application
```

### Modules Métier Détaillés

#### **Module Auth (auth/)**

**Fonctionnalités :**

- Connexion avec email/mot de passe
- Intégration LDAP (optionnelle)
- Génération et validation JWT
- Refresh tokens
- Déconnexion

**Endpoints :**

- `POST /api/v1/auth/login` : Connexion
- `POST /api/v1/auth/refresh` : Renouvellement token
- `POST /api/v1/auth/logout` : Déconnexion

#### **Module MFA (mfa/)**

**Fonctionnalités :**

- Génération de secrets TOTP
- QR codes pour applications authenticator
- Validation codes 2FA
- Activation/désactivation 2FA

**Endpoints :**

- `POST /api/v1/mfa/setup` : Configuration 2FA
- `POST /api/v1/mfa/verify` : Vérification code
- `POST /api/v1/mfa/disable` : Désactivation

#### **Module Assistance (assistance/)**

**Fonctionnalités :**

- Création de demandes d'assistance
- Upload de fichiers joints
- Workflow de validation multiniveau
- Historique et commentaires
- Notifications automatiques

**Endpoints :**

- `POST /api/v1/assistance` : Créer demande
- `GET /api/v1/assistance` : Lister demandes
- `GET /api/v1/assistance/:id` : Détail demande
- `PUT /api/v1/assistance/:id/validate` : Valider
- `PUT /api/v1/assistance/:id/reject` : Rejeter

#### **Module User (user/)**

**Fonctionnalités :**

- Gestion des profils utilisateur
- Attribution de rôles
- Gestion des permissions
- Historique des actions

#### **Module Session (session/)**

**Fonctionnalités :**

- Suivi des sessions actives
- Géolocalisation des connexions
- Révocation de sessions
- Détection d'appareils

### Base de Données (Sequelize)

#### **Modèles Principaux**

**UserModel :**

```typescript
{
  id: number,
  name: string,
  email: string,
  password: string,          // Haché avec bcrypt
  isActive: boolean,
  isLdap: boolean,
  isEmailVerified: boolean,
  userPreferences: {
    enable2FA: boolean,
    emailNotification: boolean,
    twoFactorSecret?: string
  }
}
```

**AssistanceRequestModel :**

```typescript
{
  id: number,
  reference: string,         // Généré automatiquement
  titre: string,
  description: string,
  priorite: 'basse' | 'normale' | 'haute' | 'critique',
  statut: 'draft' | 'submitted' | 'verified' | ...,
  regionId: number,
  delegationId: number,
  agenceId: number,
  applicationId: number,
  requestorId: number,       // Créateur
  assignedToId?: number,     // Technicien assigné
  // Workflow
  verifieurId?: number,
  decId?: number,
  baoId?: number,
  // Dates
  dateEcheance?: Date,
  dateResolution?: Date
}
```

#### **Relations entre Modèles**

- User ↔ UserRole ↔ Role ↔ RolePermission ↔ Permission
- User → AssistanceRequest (requestor)
- User → AssistanceRequest (assignedTo)
- Region → Delegation → Agence
- ApplicationGroup → Application

#### **Synchronisation Automatique**

```typescript
// database.ts
await sequelize.sync({ alter: true });
// Crée/met à jour automatiquement les tables
```

### Sécurité

#### **Authentification JWT**

- **Access Token** : 15 minutes (court terme)
- **Refresh Token** : 30 jours (long terme)
- Stockage sécurisé dans cookies httpOnly

#### **2FA (TOTP)**

- Intégration avec Google Authenticator, Authy
- QR codes générés avec `qrcode`
- Validation avec `speakeasy`

#### **Rate Limiting**

- Limitation globale : 100 req/15min
- Limitation login : 5 req/15min
- Protection contre brute force

#### **Validation des Données**

- Tous les inputs validés avec **Zod**
- Sanitisation automatique
- Messages d'erreur structurés

### Système de Logs

```typescript
// Configuration Winston
{
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/%DATE%-app.log',
      datePattern: 'YYYY-MM-DD'
    })
  ]
}
```

---

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** 18+
- **npm** ou **yarn**
- **MySQL** 8.0+
- **Git**

### 1. Cloner le Projet

```bash
git clone https://github.com/Hervepoh/eneo-assistance-portal.git
cd eneo-assistance-portal
```

### 2. Configuration Backend

```bash
cd backend

# Installation des dépendances
npm install

# Configuration environnement
cp .env.example .env
# Modifier .env avec vos paramètres MySQL, JWT secrets, etc.

# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE demande_assistance;
exit

# Lancer les seeds (données de référence)
npm run db:seed

# Créer des utilisateurs de test
npm run db:seed:users

# Démarrer le backend
npm run dev
```

**Le backend sera disponible sur : `http://localhost:5000`**

### 3. Configuration Frontend

```bash
cd frontend

# Installation des dépendances
npm install

# Configuration environnement (si nécessaire)
cp .env.example .env

# Démarrer le frontend
npm run dev
```

**Le frontend sera disponible sur : `http://localhost:5173`**

### 4. Vérification

#### Test Backend

```bash
# Healthcheck
curl http://localhost:5000/

# Test endpoint public
curl http://localhost:5000/api/v1/region

# Test avec script automatisé
./test-auth.ps1  # Windows
./test-auth.sh   # Linux/Mac
```

#### Test Frontend

1. Ouvrir `http://localhost:5173`
2. Voir la page de connexion
3. Pas d'erreurs dans la console navigateur

---

## 👤 Gestion des Utilisateurs

### Créer des Utilisateurs de Test

#### Méthode 1 : Script Automatisé (Recommandée)

```bash
cd backend
npm run db:seed:users
```

**Utilisateurs créés :**
| Email | Mot de passe | Rôle suggéré |
|-------|-------------|-------------|
| `admin@test.com` | `password123` | Admin |
| `manager@test.com` | `password123` | Manager |
| `user@test.com` | `password123` | User |
| `tech@test.com` | `password123` | Technician |

#### Méthode 2 : SQL Direct

```sql
-- Se connecter à MySQL
mysql -u root -p demande_assistance

-- Créer un utilisateur
INSERT INTO users (name, email, password, is_active, is_email_verified, user_preferences, created_at, updated_at)
VALUES (
  'Test User',
  'test@eneo.cm',
  '$2b$12$LQv3c1yqBwx.r8jJwA5sA.2jGp8wE8YYxZs9nYxJ2Kg3kF2nN1YoC', -- password123
  1,
  1,
  '{"enable2FA": false, "emailNotification": true}',
  NOW(),
  NOW()
);
```

#### Méthode 3 : Interface d'Administration (Futur)

- Section `/admin/users` en développement
- Création via formulaire web
- Attribution de rôles en temps réel

### Assignation de Rôles

```sql
-- Voir les rôles disponibles
SELECT * FROM roles WHERE is_deleted = 0;

-- Assigner un rôle à un utilisateur
INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
VALUES (1, 1, NOW(), NOW());

-- Vérifier les permissions
SELECT u.name, r.name as role, p.name as permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@test.com';
```

---

## 🧭 Navigation et Fonctionnalités

### Connexion à l'Application

1. **Accéder à l'application** : `http://localhost:5173`
2. **Page de connexion** : Email + Mot de passe
3. **2FA (si activé)** : Code à 6 chiffres
4. **Redirection** : Tableau de bord principal

### Navigation Principale

#### **Sidebar (Menu Latéral)**

- 🏠 **Accueil** : Tableau de bord et statistiques
- 📋 **Nouvelle Demande** : Créer une demande d'assistance
- 📂 **Mes Demandes** : Historique de mes demandes
- ⚡ **Demandes à Traiter** : (selon rôle)
  - Vérificateur : Demandes à vérifier
  - DEC : Demandes à valider niveau 2
  - BAO : Demandes à valider niveau 3
  - Technicien : Demandes assignées

#### **Header (En-tête)**

- 👤 **Profil Utilisateur** : Nom et avatar
- 🔔 **Notifications** : (en développement)
- ⚙️ **Menu Déroulant** :
  - Paramètres de sécurité
  - Sessions actives
  - Déconnexion

### Workflow des Pages

#### **1. Tableau de Bord (Home)**

**URL** : `/home`

**Contenu :**

- Cartes de statistiques (Total, En attente, En cours, Résolues)
- Graphiques de tendances
- Demandes récentes
- Actions rapides

**Composants :**

- `Dashboard/StatsCards.tsx`
- `Dashboard/RecentRequests.tsx`
- `Dashboard/QuickActions.tsx`

#### **2. Création de Demande**

**URL** : `/request`

**Processus :**

1. **Informations générales** : Titre, Description, Priorité
2. **Localisation** : Région → Délégation → Agence
3. **Application** : Groupe d'applications → Application spécifique
4. **Fichiers joints** : Upload avec commentaires
5. **Sauvegarde** : Brouillon ou Soumission directe

**Validation :**

- Tous les champs obligatoires
- Validation côté client (React Hook Form + Zod)
- Validation côté serveur

#### **3. Mes Demandes**

**URL** : `/my-requests`

**Fonctionnalités :**

- Liste paginée de toutes mes demandes
- Filtres : Statut, Date, Priorité, Application
- Recherche par titre ou référence
- Export (futur)

**Détail d'une demande :**
**URL** : `/my-requests/:reference`

- Informations complètes
- Historique des actions
- Fichiers joints
- Workflow visuel
- Commentaires

#### **4. Demandes à Traiter (Selon Rôle)**

**Vérificateur** `/requests-to-verify`

- Demandes soumises en attente de vérification
- Actions : Valider, Rejeter, Demander complément

**DEC** `/requests-to-validate-dec`

- Demandes vérifiées en attente de validation DEC
- Historique des validations précédentes

**BAO** `/requests-to-validate-bao`

- Demandes validées DEC en attente BAO
- Validation finale avant assignation

**Technicien** `/requests-in-process`

- Demandes assignées à traiter
- Outils de résolution
- Mise à jour du statut

#### **5. Paramètres de Sécurité**

**URL** : `/security`

**Fonctionnalités :**

- **2FA Management** :
  - Activation/Désactivation
  - Génération QR Code
  - Codes de récupération
- **Changement mot de passe**
- **Historique des connexions**

#### **6. Sessions Actives**

**URL** : `/sessions`

**Affichage :**

- Liste des sessions actives
- Informations : Appareil, Localisation, IP, Date
- Session actuelle marquée
- Révocation de sessions distantes

### Interactions Utilisateur

#### **Création d'une Demande**

```
1. Utilisateur clique "Nouvelle Demande"
2. Formulaire en étapes :
   - Infos générales
   - Sélection région/agence
   - Choix application
   - Upload fichiers
3. Validation en temps réel
4. Sauvegarde brouillon possible
5. Soumission finale
6. Génération référence automatique
7. Notification aux vérificateurs
```

#### **Validation par Vérificateur**

```
1. Vérificateur accède à "Demandes à vérifier"
2. Sélectionne une demande
3. Examine les détails
4. Options :
   - Valider → Passe au DEC
   - Rejeter → Retour demandeur
   - Demander complément
5. Commentaire obligatoire
6. Notification automatique
```

---

## 🔐 Authentification et Sécurité

### Système d'Authentification

#### **JWT (JSON Web Tokens)**

```typescript
// Structure du token
{
  "iss": "eneo-assistance-portal",
  "sub": "user-id",
  "email": "user@eneo.cm",
  "iat": 1634567890,
  "exp": 1634568790,
  "roles": ["user", "verificateur"]
}
```

**Gestion des tokens :**

- **Access Token** : 15 minutes, pour les requêtes API
- **Refresh Token** : 30 jours, pour renouveler l'access token
- Stockage sécurisé dans cookies httpOnly
- Rotation automatique

#### **2FA (Two-Factor Authentication)**

**Configuration :**

1. Utilisateur active 2FA dans `/security`
2. Backend génère secret TOTP unique
3. QR Code affiché à scanner avec app authenticator
4. Validation du premier code
5. Activation confirmée

**Processus de connexion avec 2FA :**

```
1. Email + Mot de passe ✓
2. Vérification 2FA requise
3. Code à 6 chiffres demandé
4. Validation du code TOTP
5. Connexion accordée
```

### Protection des Routes

#### **Frontend (React Router)**

```typescript
// Routes publiques (BaseLayout)
<Route element={<PublicRoute />}>
  <Route path="" element={<Login />} />
  <Route path="signup" element={<SignUp />} />
  <Route path="forgot-password" element={<ForgotPassword />} />
</Route>

// Routes protégées (AppLayout)
<Route element={<AuthRoute />}>
  <Route path="home" element={<Home />} />
  <Route path="request" element={<Request />} />
  // ...
</Route>
```

#### **Backend (Express Middlewares)**

```typescript
// Middleware d'authentification JWT
app.use("/api/v1/session", authenticateJWT, sessionRoutes);
app.use("/api/v1/assistance", authenticateJWT, assistanceRoutes);

// Routes publiques
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/region", regionRoutes);
```

### Permissions et Rôles (RBAC)

#### **Système de Permissions**

```typescript
// Permissions de base
enum Permissions {
  CREATE_REQUEST = "create_request",
  VIEW_OWN_REQUESTS = "view_own_requests",
  VIEW_ALL_REQUESTS = "view_all_requests",
  VERIFY_REQUESTS = "verify_requests",
  VALIDATE_DEC = "validate_dec",
  VALIDATE_BAO = "validate_bao",
  ASSIGN_TECHNICIAN = "assign_technician",
  RESOLVE_REQUESTS = "resolve_requests",
  MANAGE_USERS = "manage_users",
}
```

#### **Rôles Types**

| Rôle             | Permissions Principales                           |
| ---------------- | ------------------------------------------------- |
| **User**         | Créer demandes, Voir ses demandes                 |
| **Verificateur** | + Vérifier demandes niveau 1                      |
| **DEC**          | + Valider demandes niveau 2                       |
| **BAO**          | + Valider demandes niveau 3, Assigner techniciens |
| **Technicien**   | + Résoudre demandes assignées                     |
| **Admin**        | Toutes permissions + Gestion utilisateurs         |

---

## 📊 Workflow des Demandes

### États d'une Demande

```
Brouillon → Soumise → Vérifiée → Validée DEC → Validée BAO → Assignée → En Cours → Résolue → Fermée
                    ↓          ↓             ↓
                 Rejetée   Rejetée      Rejetée
```

### Détail des Étapes

#### **1. Création (Utilisateur)**

- **Statut** : `draft` → `submitted`
- **Actions** :
  - Remplir formulaire complet
  - Joindre fichiers (optionnel)
  - Sauvegarder brouillon OU Soumettre
- **Notifications** : Vérificateurs alertés

#### **2. Vérification (Vérificateur)**

- **Statut** : `submitted` → `verified` ou `rejected_verificateur`
- **Critères de vérification** :
  - Complétude des informations
  - Pertinence de la demande
  - Classification correcte
- **Actions possibles** :
  - ✅ Valider : Passe au DEC
  - ❌ Rejeter : Retour au demandeur avec commentaires
  - 📝 Demander complément d'information

#### **3. Validation DEC (Directeur Exploitation Commercial)**

- **Statut** : `verified` → `validated_dec` ou `rejected_dec`
- **Critères** :
  - Impact commercial
  - Budget nécessaire
  - Priorité business
- **Actions** :
  - ✅ Valider : Passe au BAO
  - ❌ Rejeter : Retour avec justification

#### **4. Validation BAO (Bureau d'Assistance et d'Orientation)**

- **Statut** : `validated_dec` → `validated_bao` ou `rejected_bao`
- **Critères** :
  - Faisabilité technique
  - Ressources disponibles
  - Planning des équipes
- **Actions** :
  - ✅ Valider et assigner : Choix du technicien
  - ❌ Rejeter : Retour avec plan alternatif

#### **5. Traitement (Technicien)**

- **Statut** : `assigned` → `in_progress` → `resolved`
- **Workflow technicien** :
  1. Accepter l'assignation
  2. Diagnostiquer le problème
  3. Mettre à jour régulièrement
  4. Résoudre et documenter
  5. Marquer comme résolu

#### **6. Clôture (Demandeur)**

- **Statut** : `resolved` → `closed`
- **Actions** :
  - Vérifier la résolution
  - Confirmer satisfaction
  - Évaluer le service (futur)

---

## 🛠️ Technologies Utilisées

### Frontend Stack

#### **React 18**

- **Concurrent Features** : Suspense, Transitions
- **Hooks modernes** : useCallback, useMemo, custom hooks
- **Context API** : Gestion d'état global légère

#### **TypeScript**

- **Typage strict** : Sécurité à la compilation
- **Interfaces complètes** : Contrats API clairs
- **Auto-complétion** : Meilleure expérience développeur

#### **Vite**

- **Build rapide** : Hot Module Replacement instantané
- **Optimisations** : Tree-shaking, code splitting
- **Dev server** : Proxy API intégré

#### **TailwindCSS + shadcn/ui**

- **Utility-first** : Classes CSS atomiques
- **Composants pré-stylés** : shadcn/ui components
- **Responsive design** : Mobile-first approach
- **Dark mode ready** : Support thème sombre

#### **TanStack Query (React Query)**

```typescript
// Exemple d'utilisation
const {
  data: requests,
  isLoading,
  error,
} = useQuery({
  queryKey: ["requests", filters],
  queryFn: () => api.getRequests(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
});
```

#### **React Hook Form + Zod**

```typescript
// Validation de formulaire
const schema = z.object({
  titre: z.string().min(5, "Titre trop court"),
  email: z.string().email("Email invalide"),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});
```

### Backend Stack

#### **Node.js + Express**

- **Runtime moderne** : ES2022 support
- **Middleware ecosystem** : Riche écosystème
- **Performance** : Event-driven, non-blocking I/O

#### **TypeScript**

- **Développement sûr** : Détection d'erreurs à la compilation
- **Interfaces partagées** : Cohérence frontend/backend
- **Refactoring facile** : IDE support

#### **Sequelize ORM**

```typescript
// Définition de modèle
class UserModel extends Model<UserAttributes> {
  public async comparePassword(value: string): Promise<boolean> {
    return compareValue(value, this.password);
  }
}

// Relations
UserModel.hasMany(AssistanceRequestModel, { foreignKey: "requestorId" });
AssistanceRequestModel.belongsTo(UserModel, { foreignKey: "requestorId" });
```

#### **MySQL**

- **Base relationnelle** : ACID compliant
- **Performance** : Indexation optimisée
- **Backup** : Outils de sauvegarde robustes

#### **JWT + 2FA**

```typescript
// Génération token
const accessToken = jwt.sign(
  { userId: user.id, email: user.email },
  config.JWT.SECRET,
  { expiresIn: config.JWT.EXPIRES_IN }
);

// 2FA avec TOTP
const secret = speakeasy.generateSecret({
  name: `ENEO Portal (${user.email})`,
  issuer: "ENEO",
});
```

#### **Winston Logging**

```typescript
// Configuration logs
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: "logs/%DATE%-app.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
```

---

## 📚 Documentation Complémentaire

### Fichiers de Documentation

| Fichier                              | Description                            |
| ------------------------------------ | -------------------------------------- |
| `backend/README.md`                  | Guide spécifique backend               |
| `backend/GUIDE_UTILISATEURS_TEST.md` | Création utilisateurs test             |
| `backend/test-auth.ps1`              | Script test authentification Windows   |
| `backend/test-auth.sh`               | Script test authentification Linux/Mac |
| `postman_collection.json`            | Tests API Postman                      |
| `postman_environment.json`           | Variables Postman                      |

### Scripts Utiles

#### **Backend**

```bash
# Développement
npm run dev              # Démarrer en mode dev
npm run build           # Compiler pour production
npm start              # Lancer en production

# Base de données
npm run db:seed        # Données de référence
npm run db:seed:users  # Utilisateurs de test
npm run db:clear       # Nettoyer la base
```

#### **Frontend**

```bash
# Développement
npm run dev            # Démarrer en mode dev
npm run build         # Compiler pour production
npm run preview       # Prévisualiser build
npm run lint          # Linter le code
```

### API Endpoints Principaux

#### **Authentification**

```
POST /api/v1/auth/login          # Connexion
POST /api/v1/auth/refresh        # Renouvellement token
POST /api/v1/auth/logout         # Déconnexion
```

#### **2FA**

```
POST /api/v1/mfa/setup          # Configuration 2FA
POST /api/v1/mfa/verify         # Vérification code
POST /api/v1/mfa/disable        # Désactivation
```

#### **Demandes d'Assistance**

```
GET  /api/v1/assistance         # Lister demandes
POST /api/v1/assistance         # Créer demande
GET  /api/v1/assistance/:id     # Détail demande
PUT  /api/v1/assistance/:id     # Modifier demande
PUT  /api/v1/assistance/:id/validate  # Valider
PUT  /api/v1/assistance/:id/reject    # Rejeter
```

#### **Données de Référence**

```
GET /api/v1/region              # Régions ENEO
GET /api/v1/delegation          # Délégations
GET /api/v1/agence              # Agences
GET /api/v1/application         # Applications métier
```

### Configuration Recommandée

#### **Variables d'Environnement Backend**

```bash
# .env
NODE_ENV=development
PORT=5000
APP_ORIGIN=http://localhost:5173

DB_NAME=demande_assistance
DB_USER=eneo_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=3306

JWT_SECRET=super_secret_key_at_least_32_chars
JWT_REFRESH_SECRET=another_super_secret_key

RESEND_API_KEY=re_xxxxx
MAILER_SENDER=noreply@eneo.cm
```

### Troubleshooting Commun

#### **Erreurs Fréquentes**

**1. CORS Policy Error**

```
Solution: Vérifier APP_ORIGIN dans .env backend
Doit correspondre à l'URL du frontend (http://localhost:5173)
```

**2. 401 Unauthorized sur /session/**

```
Normal si utilisateur non connecté
Endpoints protégés nécessitent JWT valide
```

**3. Erreur de connexion MySQL**

```
Vérifier que MySQL est démarré
Contrôler les variables DB_* dans .env
Tester: mysql -u eneo_user -p -h localhost
```

### Prochaines Évolutions

#### **Fonctionnalités à Venir**

- [ ] Interface d'administration complète
- [ ] Système de notifications in-app
- [ ] Tableau de bord analytique avancé
- [ ] Export des données (Excel, PDF)
- [ ] API webhooks pour intégrations externes
- [ ] Application mobile (React Native)

#### **Améliorations Techniques**

- [ ] Tests automatisés (Jest, Cypress)
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Containerisation Docker
- [ ] Monitoring (Prometheus, Grafana)
- [ ] Documentation API (Swagger)

---

## 🎯 Conclusion

Le **ENEO Assistance Portal** est une solution complète de gestion des demandes d'assistance qui combine :

- ✅ **Architecture moderne** : React + Node.js + TypeScript
- ✅ **Sécurité robuste** : JWT + 2FA + RBAC
- ✅ **Workflow métier** : Validation multiniveau
- ✅ **Expérience utilisateur** : Interface intuitive et responsive
- ✅ **Scalabilité** : Architecture modulaire et extensible

Pour commencer rapidement :

1. **Cloner le projet**
2. **Configurer backend et frontend**
3. **Créer des utilisateurs de test**
4. **Explorer les fonctionnalités**

La documentation complète et les scripts fournis permettent une mise en route rapide et un développement efficace.

---

**📞 Support**  
Pour toute question ou problème, consultez la documentation spécifique dans chaque dossier ou contactez l'équipe de développement.
