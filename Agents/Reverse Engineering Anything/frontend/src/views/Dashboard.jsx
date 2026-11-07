import { useCallback, useEffect, useRef, useState } from 'react';
import HelpButton from '../components/HelpButton.jsx';
import { api } from '../api.js';

export default function Dashboard({ ctx }) {
  const { navigate, openHelp } = ctx;
  const [state, setState] = useState({ status: 'loading' });
  const load = useCallback(async () => {
    try {
      const [reports, submissions] = await Promise.all([api.reports(), api.submissions()]);
      setState({ status: 'ready', reports: reports.reports, submissions: submissions.submissions });
    } catch { setState({ status: 'error' }); }
  }, []);
  const headingRef = useRef(null);
  useEffect(() => { load(); }, [load]);
  // The original focused the heading only after data loaded; restore focus lost when the loading heading is replaced.
  useEffect(() => {
    if (state.status === 'loading' || !headingRef.current) return;
    const a = document.activeElement;
    if (!a || a === document.body) { headingRef.current.setAttribute('tabindex', '-1'); headingRef.current.focus({ preventScroll: true }); }
  }, [state.status]);

  if (state.status === 'loading') return <><h1>Dashboard</h1><p className="home-subtitle" role="status">Loading…</p></>;
  if (state.status === 'error') return <><h1 ref={headingRef}>Dashboard</h1><p role="alert">Activity is unavailable. Please refresh the page.</p></>;

  const { reports, submissions } = state;
  const rows = [
    ...reports.map(r => ({ reference: r.reference, name: 'Reporting E-Crime', createdAt: r.createdAt })),
    ...submissions.map(r => ({ reference: r.reference, name: r.serviceName, createdAt: r.createdAt }))
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reset = async () => {
    if (!confirm('Delete all saved requests?')) return;
    try { await api.reset(); load(); } catch { alert('Could not clear data. Please try again.'); }
  };

  return (
    <>
      <div className="welcome-row"><div><h1 ref={headingRef}>Dashboard</h1><p className="home-subtitle">Your recent requests.</p></div><HelpButton onHelp={openHelp} /></div>
      <div className="dashboard-stats">
        <section className="info-card"><h2>E-Crime reports</h2><strong>{reports.length}</strong></section>
        <section className="info-card"><h2>Service requests</h2><strong>{submissions.length}</strong></section>
        <section className="info-card"><h2>Total</h2><strong>{reports.length + submissions.length}</strong></section>
      </div>
      <section className="info-card">
        <h2>Recent activity</h2>
        {rows.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead><tr><th>Reference</th><th>Service</th><th>Created</th></tr></thead>
              <tbody>{rows.map(r => <tr key={r.reference}><td>{r.reference}</td><td>{r.name}</td><td>{new Date(r.createdAt).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p>No activity yet. Start a service to see it here.</p>}
        <button className="primary" id="dashboard-services" onClick={() => navigate('/app/services')}>Browse services</button>{' '}
        <button className="secondary" id="dashboard-reset" data-testid="dashboard-reset" onClick={reset}>Clear data</button>
      </section>
    </>
  );
}
