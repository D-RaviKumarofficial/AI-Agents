import type { ICaseDomainService } from './ICaseDomainService.ts';
import type { UserBO } from '@/types/orchestration/AccessBO.ts';
import type { CaseBO } from '@/types/orchestration/CaseBO.ts';
import { canApprove } from '@/helpers/config/accessConfig.ts';
import {
  ServiceResultStatusENUM,
  type ServiceResult,
} from '@/helpers/serviceResult/serviceResultHelpers.ts';

class MockCaseDomainService implements ICaseDomainService {
  async review(
    user: UserBO,
    record: CaseBO,
    decision: 'approved' | 'rejected',
    note: string,
  ): Promise<ServiceResult<CaseBO>> {
    if (!canApprove(user, record.capability)) {
      return {
        statusCode: ServiceResultStatusENUM.UNAUTHORIZED,
        data: null,
        message: 'Your role cannot review this case.',
      };
    }
    if (record.status !== 'awaiting-approval' || note.trim().length < 10 || note.length > 500) {
      return {
        statusCode: ServiceResultStatusENUM.BAD_REQUEST,
        data: null,
        message: 'A pending recommendation and a review note of 10–500 characters are required.',
      };
    }
    return {
      statusCode: ServiceResultStatusENUM.OK,
      data: {
        ...record,
        status: decision === 'approved' ? 'approved' : 'investigating',
        approval: {
          officer: user.name,
          time: new Date().toISOString(),
          note: note.trim(),
          decision,
        },
      },
      message: `Recommendation ${decision} in this demo session. No external action was performed.`,
    };
  }
}
export const caseDomainService: ICaseDomainService = new MockCaseDomainService();
