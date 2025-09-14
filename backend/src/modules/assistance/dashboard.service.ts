// services/dashboard.service.ts
import { Op, WhereOptions } from 'sequelize';
import { AssistanceRequestViewModel } from '../../database/models';

export interface DashboardStats {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesEnCours: number;
  demandesResolues: number;
  evolutionTotal: number;
  evolutionEnAttente: number;
  evolutionEnCours: number;
  evolutionResolues: number;
  demandesRecentes: any[];
}

export class DashboardService {
  
  /**
   * Récupère les statistiques du tableau de bord
   */
  async getDashboardStats(userId: number): Promise<DashboardStats> {
    // Date pour le mois dernier
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    // Statistiques du mois courant
    const [
      totalDemandes,
      demandesBrouillons,
      demandesEnAttente,
      demandesEnModification,
      demandesEnVerification,
      demandesEnVDEC,
      demandesEnVBAO,
      demandesEnVBOTH,
      demandesEnCours,
      demandesResolues
    ] = await Promise.all([
      this.getCountByStatus(userId, null), // Total
      this.getCountByStatus(userId, 'DRAFT'), // En attente
      this.getCountByStatus(userId, 'SUBMITTED'), // En attente
      this.getCountByStatus(userId, 'TO_MODIFY'), // En cours
      this.getCountByStatus(userId, 'UNDER_VERIFICATION'), // En cours
      this.getCountByStatus(userId, 'PENDING_DELEGUE'), // En cours
      this.getCountByStatus(userId, 'PENDING_BUSINESS'), // En cours
      this.getCountByStatus(userId, 'PENDING_BOTH'), // En cours
      this.getCountByStatus(userId, 'TO_PROCESS'), // En cours
      this.getCountByStatus(userId, 'CLOSED')  // Résolues
    ]);

    // Statistiques du mois dernier pour calculer l'évolution
    const [
      totalLastMonth,
      enAttenteLastMonth,
      enCoursLastMonth,
      resoluesLastMonth
    ] = await Promise.all([
      this.getCountByStatus(userId, null, lastMonth, now),
      this.getCountByStatus(userId, 'SUBMITTED', lastMonth, now),
      this.getCountByStatus(userId, 'TO_PROCESS', lastMonth, now),
      this.getCountByStatus(userId, 'CLOSED', lastMonth, now)
    ]);

    // Calcul des évolutions en pourcentage
    const evolutionTotal = this.calculateEvolution(totalDemandes, totalLastMonth);
    const evolutionEnAttente = this.calculateEvolution(demandesEnAttente, enAttenteLastMonth);
    const evolutionEnCours = this.calculateEvolution(demandesEnCours, enCoursLastMonth);
    const evolutionResolues = this.calculateEvolution(demandesResolues, resoluesLastMonth);

    // Demandes récentes (5 dernières)
    const demandesRecentes = await this.getRecentRequests(userId, 5);

    return {
      totalDemandes,
      demandesEnAttente,
      demandesEnCours,
      demandesResolues,
      evolutionTotal,
      evolutionEnAttente,
      evolutionEnCours,
      evolutionResolues,
      demandesRecentes
    };
  }

  /**
   * Compte les demandes par statut
   */
  private async getCountByStatus(
    userId: number, 
    status: string | null, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<number> {
    const where: WhereOptions = { user_id: userId };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    return AssistanceRequestViewModel.count({ where });
  }

  /**
   * Calcule l'évolution en pourcentage
   */
  private calculateEvolution(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Récupère les demandes récentes
   */
  private async getRecentRequests(userId: number, limit: number = 5): Promise<any[]> {
    const demandes = await AssistanceRequestViewModel.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      attributes: [
        'id',
        'reference',
        'titre',
        'description',
        'status',
        'created_at',
        'application_name'
      ]
    });

    return demandes.map(demande => ({
      id: demande.id,
      reference: demande.reference,
      titre: demande.titre,
      description: demande.description,
      statut: demande.status.toLowerCase(),
      dateCreation: demande.created_at,
      application: demande.application_name
    }));
  }

  /**
   * Récupère les statistiques pour un supérieur hiérarchique
   */
  async getSupervisorStats(supervisorId: number): Promise<DashboardStats> {
    // Même logique mais avec superior_user_id
    const whereBase: WhereOptions = { superior_user_id: supervisorId };

    const [
      totalDemandes,
      demandesEnAttente,
      demandesEnCours,
      demandesResolues
    ] = await Promise.all([
      AssistanceRequestViewModel.count({ where: whereBase }),
      AssistanceRequestViewModel.count({ where: { ...whereBase, status: 'SOUMISE' } }),
      AssistanceRequestViewModel.count({ where: { ...whereBase, status: 'EN_COURS' } }),
      AssistanceRequestViewModel.count({ where: { ...whereBase, status: 'RESOLUE' } })
    ]);

    // Ici on pourrait aussi calculer les évolutions...

    const demandesRecentes = await AssistanceRequestViewModel.findAll({
      where: whereBase,
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: [
        'id',
        'reference',
        'titre',
        'description',
        'status',
        'created_at',
        'user_name',
        'application_name'
      ]
    });

    return {
      totalDemandes,
      demandesEnAttente,
      demandesEnCours,
      demandesResolues,
      evolutionTotal: 0, // À implémenter
      evolutionEnAttente: 0,
      evolutionEnCours: 0,
      evolutionResolues: 0,
      demandesRecentes: demandesRecentes.map(d => ({
        id: d.id,
        reference: d.reference,
        titre: d.titre,
        description: d.description,
        statut: d.status.toLowerCase(),
        dateCreation: d.created_at,
        demandeur: d.user_name,
        application: d.application_name
      }))
    };
  }
}