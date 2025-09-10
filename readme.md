Application Professionnelle, Flexible et Moderne de Gestion des Demandes d’Assistance

Conçois une application professionnelle, flexible et moderne de gestion des demandes d’assistance pour une entreprise basée au Cameroun.

🎯 Objectifs

Offrir une solution intuitive et robuste pour la gestion des tickets d’assistance.

Intégrer un workflow multi-niveaux de validation avec rôles hiérarchiques.

Permettre la gestion documentaire avancée (multi-fichiers avec commentaires).

Être scalable, sécurisée, et modulaire pour évoluer avec l’entreprise.

Offrir une expérience utilisateur moderne, responsive et multilingue (FR/EN).

📍 Données de référence – Localisation Cameroun

Régions : Centre, Littoral, Ouest, Nord, Sud.

Délégations : filtrées par région.

Agences : filtrées par délégation.

Sélections en cascade : Région → Délégation → Agence.

💻 Hiérarchie Applicative

Groupes d’Applications : Facturation, Technique, Commercial, RH, Finance.

Applications (ex. SIGEC, GMAO, CRM, SIRH, SAP).

Sélections en cascade : Groupe → Applications.

📝 Création d’une Demande

Un utilisateur doit pouvoir :

Sélectionner Région → Délégation → Agence.

Choisir Groupe d’application → Application.

Définir la priorité (Basse, Normale, Haute, Critique).

Saisir une description claire et détaillée.

Indiquer le bénéficiaire :

Moi-même (utilisateur connecté).

Autre utilisateur (sélection dans l’annuaire interne).

Indiquer le supérieur hiérarchique du bénéficiaire (obligatoire).

Ajouter des pièces jointes multiples, chaque fichier avec un commentaire associé.

🔄 Workflow Complet
1️⃣ Création / Soumission

État initial : Draft.

Soumission → En attente validation supérieur hiérarchique.

2️⃣ Validation Supérieur hiérarchique

Valider → passe en vérification.

Rejeter → motif obligatoire, état Rejeté.

3️⃣ Vérification

Le vérificateur contrôle la demande et les fichiers.
Options :

Envoyer en validation Délégué (DEC).

Envoyer en validation Business Owner (BAO).

Envoyer en validation DEC + BAO (double validation).

Envoyer directement en traitement.

Renvoyer au demandeur pour modification (motif obligatoire).

4️⃣ Modification par le demandeur

Le demandeur corrige et renseigne un champ Informations supplémentaires (modif) + fichiers si besoin.

Resoumet → retour chez le vérificateur.

5️⃣ Validation DEC / BAO

DEC ou BAO seul : valider (→ traitement) ou rejeter (→ rejet motivé).

DEC + BAO : les deux doivent valider pour que la demande parte en traitement.

6️⃣ Traitement & Clôture

Affectée à un traiteur (agent support).

Une fois résolue → état : Clôturé.

📊 États possibles

Draft

En attente validation supérieur

En attente vérification

En attente validation DEC

En attente validation BAO

En attente double validation DEC & BAO

En attente modification

En traitement

Rejeté

Clôturé

👥 Rôles Utilisateurs

Demandeur : crée/modifie les demandes.

Supérieur hiérarchique : valide ou rejette en premier niveau.

Vérificateur : contrôle la complétude et oriente la demande.

Délégué (DEC) : valide/rejette.

Business Owner (BAO) : valide/rejette.

Traiteur (Support/Agent) : prend en charge et clôture.

Administrateur : gère utilisateurs, hiérarchies, applications, référentiels.

⚙️ Exigences Techniques
Front-end

Framework : React ou Next.js.

UI : Tailwind CSS + composants modernes (shadcn/ui,).

Design : responsive, dark/light mode, accessibilité (a11y).

Features UX :

Formulaires dynamiques (sélections en cascade).

Drag & drop pour pièces jointes.

Notifications en temps réel (toast, mail, push).

Back-end

Framework : Node.js (Express) 
API : REST + documentation Swagger/OpenAPI.

Sécurité : JWT + cookies HttpOnly, rôles et permissions RBAC.

Base de données : PostgreSQL ou MySQL (ORM : Prisma/SQLAlchemy/sequilize).

Stockage fichiers : Local
Audit trail : journalisation de toutes les actions (qui, quand, quoi, pourquoi).

Autres

Scalabilité : architecture micro-services ou modulaire.

Notifications : emails, SMS

Reporting : tableau de bord avec filtres (par région, agence, application, statut).

Multilingue : support Français / Anglais avec i18n.

🚀 Livrables attendus

UI/UX : maquettes modernes et intuitives (Figma ou équivalent).

API back-end : endpoints sécurisés pour gérer les tickets, fichiers, validations, workflow.

Base de données : modèle relationnel documenté (diagramme ERD).

Diagramme du workflow : représentation visuelle (Mermaid/BPMN).

Documentation : guide utilisateur + guide technique.

Connexion en deux étapes : Login → Sélection du rôle si nécessaire

Validation des rôles : Blocage si aucun rôle n'est attribué

Auto-sélection : Si un seul rôle, connexion directe

Sécurité : Vérification que le rôle sélectionné appartient bien à l'utilisateur

Flexibilité : Middleware pour protéger les routes nécessitant un rôle actif

Gestion des roles et permissons (RBAC) 

