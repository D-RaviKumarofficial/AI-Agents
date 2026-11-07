import { describe, expect, it } from 'vitest';
import { CAPABILITIES, canApprove, canView } from './accessConfig.ts';
import { DEMO_ACCOUNTS } from '@/services/platform/authService/MockAuthService.ts';
import type { UserBO } from '@/types/orchestration/AccessBO.ts';

const COUNTS = { commander: 7, intake: 2, investigator: 3, dispatcher: 2, liaison: 2, auditor: 7 };

describe('Role access policy', () => {
  it.each(DEMO_ACCOUNTS)('should scope $role to its permitted capabilities', (account) => {
    const user: UserBO = { ...account, id: account.email, expiresAt: Date.now() + 60000 };
    const permitted = CAPABILITIES.filter((item) => canView(user, item.id));
    expect(permitted).toHaveLength(COUNTS[account.role]);
    expect(permitted.every((item) => canApprove(user, item.id))).toBe(account.role !== 'auditor');
  });
  it('should deny anonymous and expired sessions', () => {
    const user: UserBO = { ...DEMO_ACCOUNTS[0], id: 'expired', expiresAt: 0 };
    for (const capability of CAPABILITIES) {
      expect(canView(null, capability.id)).toBe(false);
      expect(canView(user, capability.id)).toBe(false);
      expect(canApprove(user, capability.id)).toBe(false);
    }
  });
});
