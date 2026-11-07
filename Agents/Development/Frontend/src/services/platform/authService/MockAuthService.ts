import type { IAuthService } from './IAuthService.ts';
import type { RoleBO, UserBO } from '@/types/orchestration/AccessBO.ts';
import {
  ServiceResultStatusENUM,
  type ServiceResult,
} from '@/helpers/serviceResult/serviceResultHelpers.ts';

export const DEMO_PASSWORD = 'Demo@2026';
export const DEMO_ACCOUNTS: readonly { email: string; name: string; role: RoleBO }[] = [
  { email: 'command@demo.local', name: 'Ahmed Al Mansoori', role: 'commander' },
  { email: 'intake@demo.local', name: 'Sara Khalid', role: 'intake' },
  { email: 'fraud@demo.local', name: 'Omar Hassan', role: 'investigator' },
  { email: 'dispatch@demo.local', name: 'Fatima Ali', role: 'dispatcher' },
  { email: 'liaison@demo.local', name: 'Khalid Salem', role: 'liaison' },
  { email: 'audit@demo.local', name: 'Noor Ibrahim', role: 'auditor' },
];
const SESSION_DURATION_MS = 30 * 60 * 1000;

class MockAuthService implements IAuthService {
  async login(email: string, password: string): Promise<ServiceResult<UserBO>> {
    const account = DEMO_ACCOUNTS.find((item) => item.email === email.trim().toLowerCase());
    if (!account || password !== DEMO_PASSWORD) {
      return {
        statusCode: ServiceResultStatusENUM.UNAUTHORIZED,
        data: null,
        message: 'Email or password is incorrect. Use one of the demo accounts below.',
      };
    }
    return {
      statusCode: ServiceResultStatusENUM.OK,
      data: { ...account, id: account.email, expiresAt: Date.now() + SESSION_DURATION_MS },
      message: 'Signed in',
    };
  }

  logout(): void {
    // In-memory demo sessions are cleared by the auth slice. No credentials are persisted.
  }
}

export const authService: IAuthService = new MockAuthService();
