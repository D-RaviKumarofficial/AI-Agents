import type { IDashboardScreenService } from './IDashboardScreenService.ts';
import type { UserBO } from '@/types/orchestration/AccessBO.ts';
import type { CaseBO } from '@/types/orchestration/CaseBO.ts';
import { canView } from '@/helpers/config/accessConfig.ts';
import {
  ServiceResultStatusENUM,
  type ServiceResult,
} from '@/helpers/serviceResult/serviceResultHelpers.ts';
import { DEMO_CASES } from '@/services/platform/demoDataService/demoCases.ts';

class MockDashboardScreenService implements IDashboardScreenService {
  async getCases(user: UserBO): Promise<ServiceResult<CaseBO[]>> {
    if (user.expiresAt <= Date.now()) {
      return {
        statusCode: ServiceResultStatusENUM.UNAUTHORIZED,
        data: null,
        message: 'Session expired. Sign in again.',
      };
    }
    return {
      statusCode: ServiceResultStatusENUM.OK,
      data: structuredClone(DEMO_CASES.filter((item) => canView(user, item.capability))),
      message: 'Demo cases loaded',
    };
  }
}
export const dashboardScreenService: IDashboardScreenService = new MockDashboardScreenService();
