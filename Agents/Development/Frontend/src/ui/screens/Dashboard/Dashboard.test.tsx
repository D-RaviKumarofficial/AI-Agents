import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRouter } from '@/ui/navigations/Router.tsx';
import { store } from '@/store/store.ts';
import { signIn, signOut } from '@/store/slices/authSlice.ts';
import { DEMO_ACCOUNTS } from '@/services/platform/authService/MockAuthService.ts';
import type { RoleBO } from '@/types/orchestration/AccessBO.ts';

function openWorkspace(role: RoleBO, path = '/dashboard'): ReturnType<typeof render> {
  const account = DEMO_ACCOUNTS.find((item) => item.role === role)!;
  store.dispatch(signIn({ ...account, id: account.email, expiresAt: Date.now() + 60000 }));
  window.history.replaceState({}, '', path);
  return render(<AppRouter />);
}

beforeEach(() => {
  store.dispatch(signOut());
  window.history.replaceState({}, '', '/login');
});

describe('Authenticated dashboard', () => {
  it('should redirect anonymous users to login from a direct capability URL', async () => {
    window.history.replaceState({}, '', '/dashboard/saraab');
    render(<AppRouter />);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.queryByText('SAR-2026-0082')).not.toBeInTheDocument();
  });

  it('should sign in with a demo account and show all seven capabilities', async () => {
    const user = userEvent.setup();
    render(<AppRouter />);
    await user.click(
      screen.getByRole('button', { name: /Commanding Officer.*command@demo.local/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Sign in to dashboard' }));
    expect(await screen.findByRole('heading', { name: 'Command dashboard' })).toBeInTheDocument();
    const section = (
      await screen.findByRole('heading', { name: 'Connected capabilities' })
    ).closest('section')!;
    expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(7);
    expect(await screen.findByText('GrowDXB investment complaint')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(15);
  });

  it('should keep login errors visible for invalid credentials', async () => {
    const user = userEvent.setup();
    render(<AppRouter />);
    await user.type(screen.getByLabelText('Officer email'), 'unknown@demo.local');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in to dashboard' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect');
    expect(screen.queryByRole('heading', { name: 'Command dashboard' })).not.toBeInTheDocument();
  });

  it('should show only intake data and label all other capabilities as restricted', async () => {
    openWorkspace('intake');
    expect(await screen.findByText('GrowDXB investment complaint')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.queryByText('Share-dividend fraud cluster')).not.toBeInTheDocument();
    expect(screen.queryByText('Suspected synthetic CEO video')).not.toBeInTheDocument();
    expect(screen.getAllByText('Not available to your role')).toHaveLength(5);
  });

  it('should deny a direct URL to a forbidden capability without revealing any cases', async () => {
    openWorkspace('intake', '/dashboard/saraab');
    expect(await screen.findByRole('alert')).toHaveTextContent('Access restricted');
    expect(screen.queryByText('Suspected synthetic CEO video')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should search and filter an authorised capability queue', async () => {
    const user = userEvent.setup();
    openWorkspace('commander', '/dashboard/moi');
    await screen.findByText('Dubai–Sharjah hit-and-run coordination');
    expect(screen.getAllByRole('row')).toHaveLength(3);
    await user.type(screen.getByLabelText('Search cases'), 'handover');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await user.selectOptions(screen.getByLabelText('Priority'), 'critical');
    expect(screen.getByRole('heading', { name: 'No matching cases' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('should prohibit approval by a read-only auditor', async () => {
    const user = userEvent.setup();
    openWorkspace('auditor');
    await user.click(await screen.findByRole('button', { name: 'View case DXB-2026-4421' }));
    expect(screen.getByText(/Your role is read-only/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve recommendation' }),
    ).not.toBeInTheDocument();
  });

  it('should require a meaningful note and record an authorised review', async () => {
    const user = userEvent.setup();
    openWorkspace('investigator');
    await user.click(await screen.findByRole('button', { name: 'View case DXB-2026-4421' }));
    await user.click(screen.getByRole('button', { name: 'Return for investigation' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('10–500 characters');
    await user.type(
      screen.getByLabelText(/Review note/),
      'Checked the submitted evidence and assigned the fraud team.',
    );
    await user.click(screen.getByRole('button', { name: 'Approve recommendation' }));
    expect(await screen.findByText('Approved by Omar Hassan')).toBeInTheDocument();
    expect(screen.getByText(/No external action was performed/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve recommendation' }),
    ).not.toBeInTheDocument();
  });

  it('should clear access on logout and require login when revisiting protected data', async () => {
    const user = userEvent.setup();
    openWorkspace('commander');
    await screen.findByText('GrowDXB investment complaint');
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(store.getState().auth.user).toBeNull();
    expect(screen.queryByText('GrowDXB investment complaint')).not.toBeInTheDocument();
  });

  it('should redirect to login when the session is cleared', async () => {
    openWorkspace('commander');
    await screen.findByText('GrowDXB investment complaint');
    act(() => {
      store.dispatch(signOut());
    });
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('should have no automated accessibility violations on login and the dashboard', async () => {
    const login = render(<AppRouter />);
    expect((await axe(login.container)).violations).toEqual([]);
    login.unmount();
    const dashboard = openWorkspace('commander');
    await screen.findByText('GrowDXB investment complaint');
    expect((await axe(dashboard.container)).violations).toEqual([]);
  });
});
