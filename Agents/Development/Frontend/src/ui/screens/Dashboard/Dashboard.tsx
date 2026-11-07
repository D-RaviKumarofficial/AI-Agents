import { useId, type ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRight,
  Building,
  Camera,
  CheckCheck,
  ChevronDown,
  Clock3,
  FileSearch,
  Globe,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Network,
  ScanFace,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Waypoints,
  X,
} from 'lucide-react';
import { CASE_STATUS_LABELS, formatCaseTime } from '@/helpers/utilities/caseFormatting.ts';
import { useDashboardViewModel } from './Dashboard.vm.ts';

export function Dashboard(): ReactElement {
  const vm = useDashboardViewModel();
  const searchId = useId();
  const statusId = useId();
  const severityId = useId();
  const noteId = useId();
  const detailId = useId();
  const ICONS = { FileSearch, Network, ScanFace, Camera, Globe, Building, Waypoints };

  function renderMetrics(): ReactElement {
    return (
      <section className="metrics-grid" aria-label="Metrics for accessible cases">
        <article className="metric">
          <div>
            <span>Accessible cases</span>
            <FileSearch size={20} aria-hidden="true" />
          </div>
          <strong>{vm.scopedCases.length.toString().padStart(2, '0')}</strong>
          <p>
            Across{' '}
            {vm.activeCapability
              ? 'this capability'
              : `${vm.accessibleCount} authorised capabilities`}
          </p>
        </article>
        <article className="metric">
          <div>
            <span>Awaiting approval</span>
            <Clock3 size={20} aria-hidden="true" />
          </div>
          <strong>{vm.pendingCount.toString().padStart(2, '0')}</strong>
          <p>Human decisions required</p>
        </article>
        <article className="metric">
          <div>
            <span>High priority</span>
            <TriangleAlert size={20} aria-hidden="true" />
          </div>
          <strong>{vm.highSeverityCount.toString().padStart(2, '0')}</strong>
          <p>High and critical severity</p>
        </article>
        <article className="metric">
          <div>
            <span>Officer reviews</span>
            <CheckCheck size={20} aria-hidden="true" />
          </div>
          <strong>{vm.reviewedCount.toString().padStart(2, '0')}</strong>
          <p>Recorded in this demo session</p>
        </article>
      </section>
    );
  }

  function renderCapabilityGrid(): ReactElement {
    return (
      <section className="capability-section" aria-labelledby="capability-heading">
        <div className="section-heading">
          <div>
            <h2 id="capability-heading">Connected capabilities</h2>
            <p>Seven workflows. One officer-led workspace.</p>
          </div>
          <span className="subtle-label">{vm.accessibleCount} OF 7 ACCESSIBLE</span>
        </div>
        <div className="capability-grid">
          {vm.capabilities.map((item) => {
            const Icon = ICONS[item.icon];
            const allowed = vm.mayView(item.id);
            const records = allowed
              ? vm.cases.filter((record) => record.capability === item.id)
              : [];
            const pending = records.filter(
              (record) => record.status === 'awaiting-approval',
            ).length;
            return (
              <article className={`capability-card ${allowed ? '' : 'restricted'}`} key={item.id}>
                <div className="capability-card-top">
                  <span className="capability-icon">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <span className={allowed ? 'access-label' : 'locked-label'}>
                    {allowed ? (
                      'Authorised'
                    ) : (
                      <>
                        <LockKeyhole size={13} aria-hidden="true" /> Restricted
                      </>
                    )}
                  </span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="capability-agent">
                  <Sparkles size={14} aria-hidden="true" />
                  {item.agent}
                </div>
                <div className="capability-card-bottom">
                  {allowed ? (
                    <>
                      <span>
                        <strong>{records.length}</strong> cases · {pending} pending
                      </span>
                      <NavLink to={`/dashboard/${item.id}`} aria-label={`Open ${item.name}`}>
                        <ArrowRight size={19} aria-hidden="true" />
                      </NavLink>
                    </>
                  ) : (
                    <span>Not available to your role</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="workspace">
      <aside className={`sidebar ${vm.mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <ShieldCheck size={27} aria-hidden="true" />
          </span>
          <div>
            Dubai Police<span>ORCHESTRATION PLATFORM</span>
          </div>
        </div>
        <button
          type="button"
          className="mobile-close icon-button"
          onClick={() => vm.setMobileMenuOpen(false)}
          aria-label="Close navigation"
        >
          <X aria-hidden="true" />
        </button>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <NavLink end to="/dashboard">
            <LayoutDashboard size={19} aria-hidden="true" />
            Overview
          </NavLink>
          <div className="sidebar-caption">CAPABILITIES</div>
          {vm.capabilities.map((item) => {
            const Icon = ICONS[item.icon];
            return vm.mayView(item.id) ? (
              <NavLink key={item.id} to={`/dashboard/${item.id}`}>
                <Icon size={19} aria-hidden="true" />
                {item.shortName}
              </NavLink>
            ) : (
              <div className="nav-restricted" key={item.id}>
                <Icon size={19} aria-hidden="true" />
                <span>{item.shortName}</span>
                <LockKeyhole size={14} aria-label="Restricted" />
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="officer-rule">
            <ShieldCheck size={22} aria-hidden="true" />
            <strong>
              Agents assist.
              <br />
              Officers decide.
            </strong>
            <p>No consequential action without human review.</p>
          </div>
          <div className="profile">
            <span className="avatar">
              {vm.user?.name
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <strong>{vm.user?.name}</strong>
              <span>{vm.roleLabel}</span>
            </div>
          </div>
          <button type="button" className="logout-button" onClick={vm.logout}>
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-path">
            <button
              type="button"
              className="mobile-toggle icon-button"
              aria-label="Open navigation"
              aria-expanded={vm.mobileMenuOpen}
              onClick={() => vm.setMobileMenuOpen(!vm.mobileMenuOpen)}
            >
              <Menu aria-hidden="true" />
            </button>
            <span>Operations</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{vm.activeCapability?.shortName ?? 'Overview'}</strong>
          </div>
          <span className="demo-label">DEMO WORKSPACE</span>
        </header>
        <main id="main-content" className="dashboard-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">DUBAI POLICE · AGENTIC ORCHESTRATION</div>
              <h1>{vm.activeCapability?.name ?? 'Command dashboard'}</h1>
              <p>
                {vm.activeCapability?.description ??
                  'A connected view of your cases, intelligence and officer decisions.'}
              </p>
            </div>
            <div className="page-heading-actions">
              <span className="role-badge">
                <ShieldCheck size={17} aria-hidden="true" />
                {vm.roleLabel}
              </span>
              {!vm.isDenied && (
                <button type="button" className="button primary" onClick={vm.showPending}>
                  Review pending
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="demo-banner">
            <Sparkles size={19} aria-hidden="true" />
            <p>
              <strong>Simulation, not a live police system.</strong> All records, matches and scores
              are synthetic. Role restrictions apply to data, metrics and reviews. No letters,
              dispatches or notifications are actually sent.
            </p>
          </div>
          {vm.isDenied ? (
            <section className="access-denied" role="alert">
              <LockKeyhole size={32} aria-hidden="true" />
              <h2>Access restricted</h2>
              <p>
                Your role cannot access this capability, or this capability does not exist. No case
                data is shown.
              </p>
              <NavLink to="/dashboard" className="button primary">
                Return to overview
              </NavLink>
            </section>
          ) : (
            <>
              {vm.isLoading ? (
                <p className="loading-state" role="status">
                  Loading your authorised workspace…
                </p>
              ) : vm.error ? (
                <div className="error-message" role="alert">
                  {vm.error}
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => void vm.loadDashboardData()}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  {renderMetrics()}
                  {!vm.activeCapability && renderCapabilityGrid()}
                  <section className="case-panel" aria-labelledby="cases-heading">
                    <div className="section-heading">
                      <div>
                        <h2 id="cases-heading">
                          {vm.activeCapability
                            ? `${vm.activeCapability.shortName} case queue`
                            : 'Operational case queue'}
                        </h2>
                        <p>Review agent findings before taking action.</p>
                      </div>
                      <span className="count-badge">
                        {vm.visibleCases.length} {vm.visibleCases.length === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                    <div className="filters">
                      <div className="search-control">
                        <label htmlFor={searchId}>Search cases</label>
                        <div>
                          <Search size={18} aria-hidden="true" />
                          <input
                            id={searchId}
                            value={vm.query}
                            onChange={(event) => vm.setQuery(event.target.value)}
                            placeholder="Case ID, title or indicator…"
                            maxLength={120}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={statusId}>Status</label>
                        <select
                          id={statusId}
                          value={vm.statusFilter}
                          onChange={(event) => vm.setStatusFilter(event.target.value)}
                        >
                          <option value="all">All statuses</option>
                          <option value="awaiting-approval">Awaiting approval</option>
                          <option value="triaged">Triaged</option>
                          <option value="investigating">Investigating</option>
                          <option value="approved">Approved</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={severityId}>Priority</label>
                        <select
                          id={severityId}
                          value={vm.severityFilter}
                          onChange={(event) => vm.setSeverityFilter(event.target.value)}
                        >
                          <option value="all">All priorities</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="button secondary clear-button"
                        onClick={vm.resetFilters}
                      >
                        Clear filters
                      </button>
                    </div>
                    <div role="status" className="sr-only">
                      {vm.visibleCases.length} matching cases
                    </div>
                    {vm.visibleCases.length === 0 ? (
                      <div className="empty-state">
                        <Search size={28} aria-hidden="true" />
                        <h3>No matching cases</h3>
                        <p>Try a different search or clear your filters.</p>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={vm.resetFilters}
                        >
                          Show all accessible cases
                        </button>
                      </div>
                    ) : (
                      <div
                        className="table-scroll"
                        tabIndex={0}
                        role="region"
                        aria-label="Accessible case records"
                      >
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">Case / agent findings</th>
                              <th scope="col">Capability</th>
                              <th scope="col">Priority</th>
                              <th scope="col">Status</th>
                              <th scope="col">Emirate</th>
                              <th scope="col">Review</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vm.visibleCases.map((record) => (
                              <tr
                                key={record.id}
                                className={vm.selectedCase?.id === record.id ? 'selected-row' : ''}
                              >
                                <td>
                                  <span className="case-id">
                                    {record.id} · {formatCaseTime(record.createdAt)} GST
                                  </span>
                                  <strong className="case-title">{record.title}</strong>
                                  <span className="case-type">{record.fraudType}</span>
                                </td>
                                <td>
                                  {
                                    vm.capabilities.find((item) => item.id === record.capability)
                                      ?.shortName
                                  }
                                </td>
                                <td>
                                  <span className={`status-badge priority-${record.severity}`}>
                                    {record.severity}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge status-${record.status}`}>
                                    {CASE_STATUS_LABELS[record.status]}
                                  </span>
                                </td>
                                <td>{record.emirates.join(' / ')}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="review-button"
                                    aria-label={`View case ${record.id}`}
                                    aria-expanded={vm.selectedCase?.id === record.id}
                                    aria-controls={detailId}
                                    onClick={() => vm.selectCase(record.id)}
                                  >
                                    {vm.selectedCase?.id === record.id ? 'Close' : 'View'}
                                    <ChevronDown size={15} aria-hidden="true" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                  <div id={detailId}>
                    {vm.selectedCase && (
                      <section className="case-detail" aria-labelledby="detail-heading">
                        <div className="section-heading">
                          <div>
                            <div className="eyebrow">CASE BRIEF · {vm.selectedCase.id}</div>
                            <h2 id="detail-heading">{vm.selectedCase.title}</h2>
                          </div>
                          <span className={`status-badge status-${vm.selectedCase.status}`}>
                            {CASE_STATUS_LABELS[vm.selectedCase.status]}
                          </span>
                        </div>
                        <p className="detail-summary">{vm.selectedCase.summary}</p>
                        <div className="detail-grid">
                          <div>
                            <h3>Agent findings</h3>
                            <ul className="findings-list">
                              {vm.selectedCase.findings.map((finding) => (
                                <li key={finding}>
                                  <CheckCheck size={17} aria-hidden="true" />
                                  {finding}
                                </li>
                              ))}
                            </ul>
                            <h3>Extracted indicators</h3>
                            <div className="indicator-list">
                              {vm.selectedCase.indicators.map((indicator) => (
                                <code key={indicator}>{indicator}</code>
                              ))}
                            </div>
                          </div>
                          <dl className="case-facts">
                            <div>
                              <dt>Assigned team</dt>
                              <dd>{vm.selectedCase.assignedUnit}</dd>
                            </div>
                            <div>
                              <dt>Model confidence (simulated)</dt>
                              <dd>{vm.selectedCase.confidence}% · requires verification</dd>
                            </div>
                            <div>
                              <dt>Reported loss</dt>
                              <dd>AED {vm.selectedCase.loss.toLocaleString('en-AE')}</dd>
                            </div>
                            <div>
                              <dt>Evidence record</dt>
                              <dd>{vm.selectedCase.evidence}</dd>
                            </div>
                            <div>
                              <dt>Review target (demo, not a legal deadline)</dt>
                              <dd>{vm.selectedCase.deadline}</dd>
                            </div>
                          </dl>
                        </div>
                        <div className="approval-panel">
                          <div>
                            <ShieldCheck size={22} aria-hidden="true" />
                            <h3>Officer decision</h3>
                          </div>
                          <p>
                            <strong>Recommendation:</strong> {vm.selectedCase.recommendedAction}
                          </p>
                          {vm.selectedCase.approval ? (
                            <div className="review-receipt">
                              <strong>
                                {vm.selectedCase.approval.decision === 'approved'
                                  ? 'Approved'
                                  : 'Returned for investigation'}{' '}
                                by {vm.selectedCase.approval.officer}
                              </strong>
                              <p>{vm.selectedCase.approval.note}</p>
                              <span>
                                Recorded at {formatCaseTime(vm.selectedCase.approval.time)} GST.
                                Demo review receipt only; not a tamper-evident audit trail.
                              </span>
                            </div>
                          ) : vm.selectedCase.status !== 'awaiting-approval' ? (
                            <p className="muted">
                              This case is not currently awaiting a decision. Continue investigation
                              before submitting a recommendation for approval.
                            </p>
                          ) : !vm.mayApprove(vm.selectedCase.capability) ? (
                            <p className="read-only-note">
                              <LockKeyhole size={16} aria-hidden="true" />
                              Your role is read-only. Only an authorised officer can approve or
                              return this recommendation.
                            </p>
                          ) : (
                            <form
                              onSubmit={(event) => {
                                event.preventDefault();
                                void vm.review('approved');
                              }}
                            >
                              <label htmlFor={noteId}>
                                Review note (required, 10–500 characters)
                              </label>
                              <textarea
                                id={noteId}
                                value={vm.reviewNote}
                                minLength={10}
                                maxLength={500}
                                onChange={(event) => vm.setReviewNote(event.target.value)}
                                rows={3}
                                required
                                placeholder="Explain your verification and decision…"
                                aria-describedby={vm.reviewError ? `${noteId}-error` : undefined}
                              />
                              <p className="muted">
                                Approval records a decision in this session only. No external action
                                is executed.
                              </p>
                              {vm.reviewError && (
                                <p id={`${noteId}-error`} className="error-message" role="alert">
                                  {vm.reviewError}
                                </p>
                              )}
                              <div className="approval-actions">
                                <button
                                  type="submit"
                                  className="button primary"
                                  disabled={vm.isReviewing}
                                >
                                  <ShieldCheck size={17} aria-hidden="true" />
                                  {vm.isReviewing ? 'Recording…' : 'Approve recommendation'}
                                </button>
                                <button
                                  type="button"
                                  className="button secondary"
                                  disabled={vm.isReviewing}
                                  onClick={() => void vm.review('rejected')}
                                >
                                  Return for investigation
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </section>
                    )}
                  </div>
                  <p className="feedback" role="status">
                    {vm.feedback}
                  </p>
                </>
              )}
            </>
          )}
          <footer className="dashboard-footer">
            <span>
              <LockKeyhole size={14} aria-hidden="true" />
              Role-scoped demo workspace · no real personal data
            </span>
            <span>UAE · Gulf Standard Time (UTC+4)</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
