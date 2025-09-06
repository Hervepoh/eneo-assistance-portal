enum VerificationEnum {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}

// tableau pour Sequelize
const VerificationEnumValues = [
  VerificationEnum.EMAIL_VERIFICATION,
  VerificationEnum.PASSWORD_RESET,
];

export { VerificationEnum , VerificationEnumValues};
