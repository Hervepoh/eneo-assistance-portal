import { ApplicationModel, AssistanceRequestModel } from "../../database/models";
import { Op } from 'sequelize'

export class ReferenceGeneratorService {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly PREFIX = 'EN-ASS';
  private static readonly SEQUENCE_LENGTH = 4;
  
  /**
   * Génère une référence unique avec gestion des conflits
   */
  static async generateUniqueReference(applicationId: number): Promise<string> {
    const reference = await this.generateReference(applicationId);

    // Vérifier l'unicité
    const isUnique = await this.isReferenceUnique(reference);
    if (isUnique) {
      return reference;
    }

    // En cas de conflit, régénérer avec un suffixe
    return this.generateWithSuffix(applicationId);
  }


  /**
 * Méthode utilitaire pour vérifier le comptage par année
 */
  static async getYearlyStats(applicationId: number, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const count = await AssistanceRequestModel.count({
      where: {
        applicationId,
        createdAt: {
          [Op.between]: [startOfYear, endOfYear]
        }
      }
    });

    return {
      year: targetYear,
      applicationId,
      count,
      nextReference: (count + 1).toString().padStart(4, '0')
    };
  }


  private static async generateReference(applicationId: number): Promise<string> {
    const application = await ApplicationModel.findByPk(applicationId);
    if (!application) {
      throw new Error('Application non trouvée');
    }

    const appCode = this.getApplicationCode(application.name);
    const currentYear = new Date().getFullYear();
    const sequentialNumber = await this.getSequentialNumber(applicationId, currentYear);

    return `${this.PREFIX}${appCode}${sequentialNumber}-${currentYear}`;
  }

  private static getApplicationCode(appName: string): string {
    const words = appName.trim().split(/\s+/);

    if (words.length === 1) {
      const shortName = words[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return shortName.length >= 3
        ? shortName.substring(0, 3)
        : shortName.padEnd(3, 'X');
    }

    const initials = words
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return initials.length >= 3
      ? initials.substring(0, 3)
      : initials.padEnd(3, 'X');
  }

  private static async getSequentialNumber(applicationId: number, year: number): Promise<string> {
    // Début et fin de l'année en cours
    const startOfYear = new Date(year, 0, 1); // 1er janvier
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999); // 31 décembre

    const count = await AssistanceRequestModel.count({
      where: {
        applicationId,
        createdAt: {
          [Op.between]: [startOfYear, endOfYear]
        }
      }
    });

    return (count + 1).toString().padStart(this.SEQUENCE_LENGTH, '0');
  }

  private static async isReferenceUnique(reference: string): Promise<boolean> {
    const existing = await AssistanceRequestModel.findOne({
      where: { reference }
    });
    return !existing;
  }

  private static async generateWithSuffix(applicationId: number): Promise<string> {
    for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
      const baseReference = await this.generateReference(applicationId);
      const referenceWithSuffix = `${baseReference}-${attempt.toString().padStart(2, '0')}`;

      if (await this.isReferenceUnique(referenceWithSuffix)) {
        return referenceWithSuffix;
      }
    }

    throw new Error('Impossible de générer une référence unique après plusieurs tentatives');
  }
}