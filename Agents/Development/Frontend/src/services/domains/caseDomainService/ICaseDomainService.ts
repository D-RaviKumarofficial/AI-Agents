import type { UserBO } from '@/types/orchestration/AccessBO.ts';
import type { CaseBO } from '@/types/orchestration/CaseBO.ts';
import type { ServiceResult } from '@/helpers/serviceResult/serviceResultHelpers.ts';

export interface ICaseDomainService {
  review(
    user: UserBO,
    record: CaseBO,
    decision: 'approved' | 'rejected',
    note: string,
  ): Promise<ServiceResult<CaseBO>>;
}
