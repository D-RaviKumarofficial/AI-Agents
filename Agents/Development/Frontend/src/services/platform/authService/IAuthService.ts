import type { UserBO } from '@/types/orchestration/AccessBO.ts';
import type { ServiceResult } from '@/helpers/serviceResult/serviceResultHelpers.ts';

export interface IAuthService {
  login(email: string, password: string): Promise<ServiceResult<UserBO>>;
  logout(): void;
}
