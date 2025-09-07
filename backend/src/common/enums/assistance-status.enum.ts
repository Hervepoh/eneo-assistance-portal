export enum AssistanceStatusEnum {
 DRAFT = "DRAFT", // brouillon
  SUBMITTED = "SUBMITTED", // envoyée au vérificateur
  TO_MODIFY = "TO_MODIFY", // renvoyée au demandeur pour modification
  UNDER_VERIFICATION = "UNDER_VERIFICATION", // vérification en cours
  PENDING_DELEGUE = "PENDING_DELEGUE", // en attente validation du délégué
  PENDING_BUSINESS = "PENDING_BUSINESS", // en attente validation du Business Owner
  PENDING_BOTH = "PENDING_BOTH", // en attente des deux (délegué + business)
  TO_PROCESS = "TO_PROCESS", // chez le traiteur pour traitement
  CLOSED = "CLOSED", // traité et clôturé
}
