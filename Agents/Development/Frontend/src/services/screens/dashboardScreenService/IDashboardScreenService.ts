import type { UserBO } from '@/types/orchestration/AccessBO.ts';
import type { CaseBO } from '@/types/orchestration/CaseBO.ts';
import type { ServiceResult } from '@/helpers/serviceResult/serviceResultHelpers.ts';

export interface IDashboardScreenService {
  getCases(user: UserBO): Promise<ServiceResult<CaseBO[]>>;
}
