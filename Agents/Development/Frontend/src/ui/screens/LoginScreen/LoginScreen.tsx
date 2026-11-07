import { useId, type ReactElement } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { CAPABILITIES, ROLE_LABELS } from '@/helpers/config/accessConfig.ts';
import { useLoginScreenViewModel } from './LoginScreen.vm.ts';

export function LoginScreen(): ReactElement {
  const vm = useLoginScreenViewModel();
  const emailId = useId();
  const passwordId = useId();

  return (
    <main className="login-page" id="main-content">
      <section className="login-story" aria-labelledby="welcome-title">
        <div className="brand">
          <span className="brand-mark">
            <ShieldCheck size={28} aria-hidden="true" />
          </span>
          <div>
            Dubai Police<span>ORCHESTRATION PLATFORM</span>
          </div>
        </div>
        <div className="login-story-content">
          <div className="eyebrow light">
            <Sparkles size={16} aria-hidden="true" /> INTELLIGENCE, CONNECTED.
          </div>
          <h1 id="welcome-title">
            Seven capabilities.
            <br />
            One coordinated
            <br />
            <em>response.</em>
          </h1>
          <p>
            An officer-first workspace connecting intake, intelligence and cross-emirate
            coordination. Agents assist. Humans decide.
          </p>
          <div className="capability-pills">
            {CAPABILITIES.map((item) => (
              <span key={item.id}>{item.shortName}</span>
            ))}
          </div>
        </div>
        <p className="login-footnote">
          <ShieldCheck size={18} aria-hidden="true" /> Human approval for every consequential action
        </p>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-inner">
          <span className="demo-label">PROTOTYPE · SYNTHETIC DATA ONLY</span>
          <h2 id="login-title">Welcome back</h2>
          <p className="muted">Sign in to your operational workspace.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void vm.login();
            }}
            className="login-form"
          >
            <label htmlFor={emailId}>Officer email</label>
            <input
              id={emailId}
              type="email"
              autoComplete="username"
              placeholder="officer@demo.local"
              value={vm.email}
              maxLength={120}
              onChange={(event) => vm.setEmail(event.target.value)}
              required
            />
            <label htmlFor={passwordId}>Password</label>
            <div className="password-field">
              <input
                id={passwordId}
                type={vm.showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={vm.password}
                onChange={(event) => vm.setPassword(event.target.value)}
                required
                maxLength={100}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={vm.showPassword ? 'Hide password' : 'Show password'}
                onClick={() => vm.setShowPassword(!vm.showPassword)}
              >
                {vm.showPassword ? (
                  <EyeOff size={19} aria-hidden="true" />
                ) : (
                  <Eye size={19} aria-hidden="true" />
                )}
              </button>
            </div>
            {vm.error && (
              <p className="error-message" role="alert">
                {vm.error}
              </p>
            )}
            <button className="button primary login-submit" type="submit" disabled={vm.isLoading}>
              {vm.isLoading ? 'Signing in…' : 'Sign in to dashboard'}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          <div className="demo-accounts">
            <h3>Explore a demo role</h3>
            <p className="muted">
              Select an account to fill the form. Password: <code>{vm.demoPassword}</code>
            </p>
            <div className="demo-role-grid">
              {vm.demoAccounts.map((account) => (
                <button
                  type="button"
                  key={account.role}
                  onClick={() => vm.selectDemo(account.email)}
                >
                  <strong>{ROLE_LABELS[account.role]}</strong>
                  <span>{account.email}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="security-note">
            <LockKeyhole size={16} aria-hidden="true" /> Demo login only. No real credentials.
            Sessions expire after 30 minutes and end on page refresh.
          </p>
        </div>
      </section>
    </main>
  );
}
