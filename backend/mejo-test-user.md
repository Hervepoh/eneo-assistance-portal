# 👤 Guide de Création - Utilisateur Medjo

**Création de l'utilisateur administrateur Medjo Marcel Miguel**

---

## 📋 Informations Utilisateur

| Champ                    | Valeur                                          |
| ------------------------ | ----------------------------------------------- |
| **Nom complet**          | Medjo Marcel Miguel                             |
| **Email**                | medjomarcelmiguel@gmail.com                     |
| **Mot de passe initial** | password123                                     |
| **Rôle principal**       | Administrateur                                  |
| **Statut**               | Actif                                           |
| **Email vérifié**        | Oui                                             |
| **2FA**                  | Désactivé (peut être activé depuis l'interface) |

---

## 🚀 Méthodes de Création

#### **Node.js Direct**

```bash
cd backend
npm run create:medjo
```

### **Méthode 2 : Exécution Manuelle**

```bash
cd backend
npx ts-node-dev --files src/scripts/create.medjo.user.ts
```

---

## 👑 Permissions et Rôles

L'utilisateur Medjo sera créé avec le **rôle administrateur** qui inclut toutes les permissions :

### **🔐 Permissions Administrateur**

- ✅ Créer des demandes d'assistance
- ✅ Voir toutes les demandes (propres + autres)
- ✅ Vérifier les demandes (niveau 1)
- ✅ Valider DEC (niveau 2)
- ✅ Valider BAO (niveau 3)
- ✅ Assigner des techniciens
- ✅ Résoudre les demandes
- ✅ Gérer les utilisateurs
- ✅ Gérer les rôles et permissions
- ✅ Consulter les rapports
- ✅ Administration système complète

### **🏢 Accès Interface**

- 🏠 **Tableau de bord** : Vue complète avec toutes les statistiques
- 📋 **Demandes** : Accès à tous les workflows de validation
- 👥 **Gestion utilisateurs** : Création, modification, attribution de rôles
- ⚙️ **Administration** : Configuration système
- 📊 **Rapports** : Tous les rapports et analyses

---

## 🎯 Processus de Création

Le script automatise les étapes suivantes :

### **1. Création des Permissions de Base**

```typescript
// Permissions créées automatiquement
-create_request -
  view_own_requests -
  view_all_requests -
  verify_requests -
  validate_dec -
  validate_bao -
  assign_technician -
  resolve_requests -
  manage_users -
  manage_roles -
  view_reports -
  manage_system;
```

### **2. Création des Rôles Standards**

```typescript
// Rôles créés pour le système
-user - // Utilisateur standard
  verificateur - // Vérificateur niveau 1
  dec - // Directeur Exploitation Commercial
  bao - // Bureau d'Assistance et d'Orientation
  technicien - // Technicien résolution
  manager - // Manager supervision
  admin; // Administrateur complet
```

### **3. Attribution des Permissions aux Rôles**

- Chaque rôle reçoit ses permissions appropriées
- L'admin reçoit **TOUTES** les permissions

### **4. Création de l'Utilisateur Medjo**

- Données personnelles
- Mot de passe sécurisé (hashé automatiquement)
- Préférences par défaut

### **5. Attribution du Rôle Admin**

- Liaison utilisateur ↔ rôle admin
- Vérification des permissions finales

---

## ✅ Vérification Post-Création

### **Vérification Base de Données**

```sql
-- Vérifier l'utilisateur
SELECT * FROM users WHERE email = 'medjmarcelmiguel@gmail.com';

-- Vérifier les rôles assignés
SELECT u.name, u.email, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'medjmarcelmiguel@gmail.com';

-- Vérifier les permissions
SELECT u.name, r.name as role_name, p.name as permission_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'medjmarcelmiguel@gmail.com';
```

### **Test de Connexion**

1. **Démarrer l'application**

   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Connexion Web**

   - Aller sur `http://localhost:5173`
   - Email : `medjmarcelmiguel@gmail.com`
   - Mot de passe : `password123`

3. **Vérifications Interface**
   - ✅ Accès au tableau de bord admin
   - ✅ Menu sidebar complet visible
   - ✅ Toutes les sections accessibles
   - ✅ Pas d'erreurs 403 (Forbidden)

---

## 🔧 Résolution de Problèmes

### **Erreur : "User already exists"**

```bash
# L'utilisateur existe déjà, le script le met à jour automatiquement
# Aucune action requise
```

### **Erreur de Connexion Base de Données**

```bash
# Vérifier que MySQL est démarré
mysql -u root -p

# Vérifier les variables .env
cat .env | grep DB_
```

### **Erreur de Permissions**

```bash
# Vérifier les rôles en base
npm run create:medjo
# Le script recrée automatiquement les rôles manquants
```

### **Mot de Passe Oublié**

```sql
-- Réinitialiser le mot de passe en base (hashé)
UPDATE users
SET password = '$2b$12$LQv3c1yqBwx.r8jJwA5sA.2jGp8wE8YYxZs9nYxJ2Kg3kF2nN1YoC'
WHERE email = 'medjmarcelmiguel@gmail.com';
-- Nouveau mot de passe: password123
```

---

## 🔐 Sécurité

### **Bonnes Pratiques**

1. **Changer le mot de passe** après la première connexion
2. **Activer la 2FA** depuis `/security`
3. **Utiliser un email réel** pour les notifications
4. **Limiter les sessions** si nécessaire

### **Configuration 2FA**

1. Aller dans `/security`
2. Cliquer "Activer 2FA"
3. Scanner le QR code avec Google Authenticator
4. Entrer le code de vérification
5. Sauvegarder les codes de récupération

---

## 📝 Logs et Monitoring

### **Fichiers de Logs**

```bash
# Logs d'application
tail -f backend/logs/$(date +%Y-%m-%d)-app.log

# Logs de création utilisateur
npm run create:medjo 2>&1 | tee creation-medjo.log
```

### **Monitoring de Session**

- Sessions actives visibles dans `/sessions`
- Géolocalisation des connexions
- Révocation possible des sessions distantes

---

## 🎉 Résultat Attendu

Après exécution réussie du script :

```
🎉 UTILISATEUR CRÉÉ AVEC SUCCÈS !
═══════════════════════════════════
👤 Nom: Medjo Marcel Miguel
📧 Email: medjmarcelmiguel@gmail.com
🔒 Mot de passe: password123
✅ Compte actif: Oui
📬 Email vérifié: Oui
🔐 2FA activé: Non

👥 RÔLES ASSIGNÉS:
  • admin
    Permissions:
      - create_request
      - view_own_requests
      - view_all_requests
      - verify_requests
      - validate_dec
      - validate_bao
      - assign_technician
      - resolve_requests
      - manage_users
      - manage_roles
      - view_reports
      - manage_system

🚀 CONNEXION:
1. Aller sur http://localhost:5173
2. Se connecter avec:
   Email: medjmarcelmiguel@gmail.com
   Mot de passe: password123

✨ L'utilisateur Medjo a tous les droits d'administration !
```

---

**🎯 L'utilisateur Medjo est maintenant prêt à administrer le portail ENEO Assistance !**
