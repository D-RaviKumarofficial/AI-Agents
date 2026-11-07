import { describe, expect, it } from 'vitest';
import { caseDomainService } from './MockCaseDomainService.ts';
import { DEMO_CASES } from '@/services/platform/demoDataService/demoCases.ts';
import { DEMO_ACCOUNTS } from '@/services/platform/authService/MockAuthService.ts';
import { dashboardScreenService } from '@/services/screens/dashboardScreenService/MockDashboardScreenService.ts';
import type { RoleBO, UserBO } from '@/types/orchestration/AccessBO.ts';

function userFor(role: RoleBO): UserBO {
  const account = DEMO_ACCOUNTS.find((item) => item.role === role)!;
  return { ...account, id: role, expiresAt: Date.now() + 60000 };
}

describe('Demo service permission checks', () => {
  it('should deny direct mutation requests by an auditor or unrelated role', async () => {
    for (const role of ['auditor', 'dispatcher'] as const) {
      const result = await caseDomainService.review(
        userFor(role),
        DEMO_CASES[0],
        'approved',
        'Verified the evidence.',
      );
      expect(result.statusCode).toBe('UNAUTHORIZED');
      expect(result.data).toBeNull();
    }
  });
  it('should reject a short note and a case without a pending recommendation', async () => {
    expect(
      (await caseDomainService.review(userFor('commander'), DEMO_CASES[0], 'approved', 'ok'))
        .statusCode,
    ).toBe('BAD_REQUEST');
    expect(
      (
        await caseDomainService.review(
          userFor('commander'),
          DEMO_CASES[1],
          'approved',
          'Verified the evidence.',
        )
      ).statusCode,
    ).toBe('BAD_REQUEST');
  });
  it('should return a rejected recommendation to investigation', async () => {
    const result = await caseDomainService.review(
      userFor('intake'),
      DEMO_CASES[0],
      'rejected',
      'More evidence required to verify the indicators.',
    );
    expect(result.statusCode).toBe('OK');
    expect(result.data?.status).toBe('investigating');
    expect(result.data?.approval?.decision).toBe('rejected');
    expect(DEMO_CASES[0].status).toBe('awaiting-approval');
  });
  it('should return only authorised data and reject expired sessions', async () => {
    const user = userFor('liaison');
    const result = await dashboardScreenService.getCases(user);
    expect(result.data).toHaveLength(4);
    expect(result.data?.every((item) => ['interpol', 'moi'].includes(item.capability))).toBe(true);
    const expired = await dashboardScreenService.getCases({ ...user, expiresAt: 0 });
    expect(expired.statusCode).toBe('UNAUTHORIZED');
    expect(expired.data).toBeNull();
  });
});
