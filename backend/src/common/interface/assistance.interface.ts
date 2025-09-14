export interface AssistanceFilters {
    status?: string;
    regionId?: number;
    delegationId?: number;
    agenceId?: number;
    applicationGroupId?: number;
    applicationId?: number;
    reference?: number;
    page: number;
    limit: number;
    q?: string;
}