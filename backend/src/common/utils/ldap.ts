import { Client } from "ldapts";
import { config } from "../../config/app.config";

/**
 * Fonction d'authentification Active Directory (adaptée de votre code PHP)
 */
const ldapLogin = async (userId: string, password: string) => {

  const { SERVER, PORT, DOMAIN } = config.LDAP;

  const LDAP_SERVER = SERVER;
  const LDAP_PORT = PORT;
  const LDAP_DOMAIN = DOMAIN;

  const LDAP_URL = `ldap://${LDAP_SERVER}:${LDAP_PORT}`;

  console.log(`Tentative de connexion AD pour: ${userId}`);

  const client = new Client({
    url: LDAP_URL,
    timeout: 10000,
    connectTimeout: 10000,
  });

  try {
    // --- CONNEXION ET AUTHENTIFICATION ---
    // Format UPN comme dans votre code PHP
    const userDn = `${userId}@${LDAP_DOMAIN}`;
    console.log(`Tentative de bind avec: ${userDn}`);

    await client.bind(userDn, password);
    console.log(`Authentification AD réussie pour: ${userId}`);

    // --- RECHERCHE DES INFORMATIONS UTILISATEUR ---
    // Recherche dans OU=Guests,OU=Cameroon (premier essai)
    let searchBase = "OU=Guests,OU=Cameroon,DC=camlight,DC=cm";
    let filter = `(&(objectCategory=person)(objectclass=user)(sAMAccountName=${userId}))`;
    let attributes = ["mail", "givenname", "sn", "displayName", "memberOf", "distinguishedName"];

    console.log(`Recherche dans: ${searchBase}`);
    const searchOptions = {
      scope: "sub" as const,
      filter: filter,
      attributes: attributes,
    };

    let { searchEntries } = await client.search(searchBase, searchOptions);

    // Si non trouvé dans Guests, recherche dans Eneo People (comme votre code PHP)
    if (searchEntries.length === 0) {
      searchBase = "OU=Eneo People,OU=People,OU=Cameroon,DC=camlight,DC=cm";
      console.log(`Non trouvé, recherche dans: ${searchBase}`);

      const secondSearch = await client.search(searchBase, searchOptions);
      searchEntries = secondSearch.searchEntries;

      if (searchEntries.length === 0) {
        console.log("Utilisateur non trouvé dans l'annuaire AD");
        throw new Error("Votre compte n'est pas valide dans l'annuaire de l'entreprise ENEO");
      }
    }

    // --- EXTRACTION DES DONNÉES UTILISATEUR ---
    const userData = searchEntries[0];
    console.log("userData", userData)

    // Formatage des données comme dans votre code PHP
    const userInfo = {
      username: userId,
      dn: userData.dn,
      email: userData.mail || "",
      givenName: userData.givenname || "",
      sn: userData.sn || "",
      displayName: userData.displayName || `${userData.givenname} ${userData.sn}`.trim(),
      groups: userData.memberOf || [],
      distinguishedName: userData.distinguishedName || ""
    };

    console.log(`Utilisateur trouvé: ${userInfo.displayName}`);
    return userInfo;

  } catch (error: any) {
    // --- GESTION DES ERREURS SPÉCIFIQUE AD ---
    console.error(`Erreur AD pour ${userId}:`, error.message);

    if (error.message.includes('invalid credentials') ||
      error.message.includes('52e') ||
      error.message.includes('49')) {
      throw new Error("Tentative de connexion échoué : Nom utilisateur ou mot de passe incorrect");
    } else if (error.message.includes('no such object') ||
      error.message.includes('525')) {
      throw new Error("Votre compte n'est pas valide dans l'annuaire de l'entreprise ENEO");
    } else if (error.message.includes('52b') ||
      error.message.includes('533')) {
      throw new Error("Compte désactivé");
    } else if (error.message.includes('775') ||
      error.message.includes('530')) {
      throw new Error("Compte verrouillé");
    } else if (error.message.includes('532')) {
      throw new Error("Mot de passe expiré");
    } else if (error.message.includes('CONNECTION_REFUSED') ||
      error.message.includes('ECONNREFUSED')) {
      throw new Error("Erreur de connexion au serveur AD");
    } else {
      throw new Error("Erreur technique lors de l'authentification AD");
    }
  } finally {
    // --- DÉCONNEXION SÉCURISÉE ---
    try {
      await client.unbind();
      console.log("Connexion AD fermée");
    } catch (unbindError: any) {
      console.warn("Erreur lors de la déconnexion AD:", unbindError.message);
    }
  }
};

// Version avec fallback superadmin (optionnel)
const ldapLoginWithFallback = async (userId: string, password: string) => {
  try {
    return await ldapLogin(userId, password);
  } catch (error) {
    // Fallback pour superadmin local si nécessaire
    const { LDAP: { ADMIN_USER, ADMIN_PASSWORD, DOMAIN } } = config;
    const isSuperadmin = (
      userId === ADMIN_USER &&
      password &&
      password === ADMIN_PASSWORD
    );

    if (!isSuperadmin) throw error; // Propagation immédiate si pas superadmin
    
    console.log('Authentification Superadmin locale réussie !');
    return {
      username: ADMIN_USER,
      dn: 'local/superadmin',
      displayName: 'Super Administrateur',
      email: `${ADMIN_USER}@${DOMAIN}`
    };

  }
};

module.exports = {
  ldapLogin: ldapLoginWithFallback,
  ldapLoginRaw: ldapLogin
};