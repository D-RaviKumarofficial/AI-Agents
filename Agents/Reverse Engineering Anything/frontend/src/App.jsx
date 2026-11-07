import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRouteTransition } from './lib/navigation.mjs';
import { api } from './api.js';
import { HOME_PATHS, emit, hasGuest, readLocation, rememberGuest } from './util.js';
import { Icon, IconContext } from './components/Icon.jsx';
import Dialog from './components/Dialog.jsx';
import ServicesAssistant from './components/ServicesAssistant.jsx';
import UtilityDialog from './components/UtilityDialog.jsx';
import ServiceDialog from './components/ServiceDialog.jsx';
import Home from './views/Home.jsx';
import Dashboard from './views/Dashboard.jsx';
import Contact from './views/Contact.jsx';
import Directory from './views/Directory.jsx';
import ServiceForm from './views/ServiceForm.jsx';
import Ecrime from './views/Ecrime.jsx';

const LOGO = '/assets/dubai-police-logo.svg';

/** Resolve what the current URL should render (port of directory.js renderRoute()). */
function resolveRoute(route, catalog) {
  const p = route.pathname;
  if (HOME_PATHS.includes(p)) return { page: 'home', view: 'home', title: 'Home', category: null };
  if (p === '/app/dashboard') return { page: 'dashboard', view: 'home', title: 'Dashboard', category: null };
  if (p === '/app/home/contactus') return { page: 'contact', view: 'home', title: 'Contact Us', category: null };
  if (p === '/app/services/ecrime') return { page: 'ecrime', view: 'ecrime', title: 'Reporting E-Crime', docTitle: 'eCrime', category: 'report_complaint' };
  if (p.startsWith('/app/services/demo/')) {
    const s = catalog.groups.flatMap(g => g.services).find(s => s.id === p.split('/').at(-1));
    if (s) return { page: 'service', view: 'directory', service: s, title: s.name, category: s.groupId ? catalog.groups.find(g => g.id === s.groupId).category : 'all' };
  }
  const id = route.hash.slice(1);
  const category = catalog.sidebar.some(c => c.id === id) ? id : 'all';
  return { page: 'directory', view: 'directory', title: catalog.sidebar.find(c => c.id === category).name, category };
}

export default function App() {
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(false);
  const [referenceIcons, setReferenceIcons] = useState({});
  const [route, setRoute] = useState(() => ({ ...readLocation(), key: 0 }));
  const [busy, setBusy] = useState(false);
  const [focusPending, setFocusPending] = useState(false);
  const [viewOverride, setViewOverride] = useState(null);
  const [filters, setFilters] = useState({ query: '', audience: 'All' });
  const [serviceDialog, setServiceDialog] = useState(null);
  const [utility, setUtility] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [guestDialog, setGuestDialog] = useState(null);
  const [guestLabel, setGuestLabel] = useState(false);
  const [reportList, setReportList] = useState(null);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [menuOpen, setMenuOpenState] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const setMenuOpen = v => { setMenuOpenState(v); setMenuExpanded(v); };
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [a11y, setA11y] = useState({ highContrast: false, largeText: false, reduceMotion: false });
  const mobileMenuRef = useRef(null), bannerRef = useRef(null), mainRef = useRef(null);
  const [menuFocus, setMenuFocus] = useState(0);
  useEffect(() => { if (menuFocus) requestAnimationFrame(() => mobileMenuRef.current?.focus()); }, [menuFocus]);

  const transition = useMemo(() => createRouteTransition({ setBusy: b => { setBusy(b); if (!b) setFocusPending(true); } }), []);
  const commitRoute = useCallback(() => { setViewOverride(null); setRoute(r => ({ ...readLocation(), key: r.key + 1 })); }, []);
  const runRoute = useCallback(() => transition.run(() => commitRoute()), [transition, commitRoute]);

  const navigate = useCallback(async path => {
    history.pushState(null, '', path);
    setServiceDialog(null); setGuestDialog(null); setUtility(null); setMenuOpen(false);
    await transition.run(() => { window.scrollTo(0, 0); commitRoute(); });
  }, [transition, commitRoute]);

  const askGuest = onContinue => setGuestDialog({ onContinue });
  const openGroup = id => { if (catalog?.groups.some(g => g.id === id)) setServiceDialog({ mode: 'group', id }); };
  const showInformation = id => { if (catalog?.groups.some(g => g.services.some(s => s.id === id))) setServiceDialog({ mode: 'info', id }); };
  const startService = id => {
    setServiceDialog(null);
    const go = () => navigate(id === 'reporting-e-crime' ? '/app/services/ecrime' : '/app/services/demo/' + id);
    if (hasGuest()) { go(); return; }
    askGuest(() => { rememberGuest(); setGuestDialog(null); go(); });
  };
  const chatView = id => { setChatOpen(false); showInformation(id); };
  const chatStart = id => { setChatOpen(false); startService(id); };
  const signIn = () => {
    if (!catalog) return;
    setServiceDialog(null);
    askGuest(() => { rememberGuest(); setGuestDialog(null); setGuestLabel(true); commitRoute(); });
  };
  const onSearch = q => { setFilters({ query: String(q ?? '').slice(0, 200), audience: 'All' }); navigate('/app/services'); };
  const link = path => e => { e.preventDefault(); navigate(path); };

  // Initial load: reference icons, then catalog, then first route render.
  useEffect(() => {
    (async () => {
      try {
        setReferenceIcons(await api.icons());
        const data = await api.catalog();
        setCatalog(data);
        await runRoute();
        const loc = readLocation();
        const groupId = new URLSearchParams(loc.search).get('group');
        const groupOpen = !!groupId && data.groups.some(g => g.id === groupId) && !HOME_PATHS.includes(loc.pathname);
        if (!groupOpen && !hasGuest() && !loc.pathname.endsWith('/ecrime') && ![...HOME_PATHS, '/app/home/contactus'].includes(loc.pathname)) {
          askGuest(() => { rememberGuest(); setGuestDialog(null); commitRoute(); });
        }
        emit('demo:catalog-ready', { groups: data.groups.length });
      } catch { setCatalogError(true); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser back/forward and hash changes.
  useEffect(() => {
    const onPop = () => { setServiceDialog(null); runRoute(); };
    addEventListener('popstate', onPop); addEventListener('hashchange', onPop);
    return () => { removeEventListener('popstate', onPop); removeEventListener('hashchange', onPop); };
  }, [runRoute]);

  // External hook kept from the original (sandbox:navigate custom event).
  useEffect(() => {
    const onNav = e => { if (catalog && typeof e.detail?.path === 'string' && e.detail.path.startsWith('/app/')) navigate(e.detail.path); };
    document.addEventListener('sandbox:navigate', onNav);
    return () => document.removeEventListener('sandbox:navigate', onNav);
  }, [catalog, navigate]);

  // Escape closes the mobile menu.
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && menuOpen) { setMenuOpen(false); setMenuFocus(n => n + 1); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Keep --banner-h in sync with the disclosure banner height.
  useEffect(() => {
    const sync = () => { if (bannerRef.current) document.documentElement.style.setProperty('--banner-h', bannerRef.current.offsetHeight + 'px'); };
    sync(); addEventListener('resize', sync); addEventListener('load', sync); document.fonts?.ready?.then(sync);
    return () => { removeEventListener('resize', sync); removeEventListener('load', sync); };
  }, []);

  const resolved = catalog ? resolveRoute(route, catalog) : null;
  const isLanding = !!resolved && (HOME_PATHS.includes(route.pathname) || ['/app/services', '/app/services/'].includes(route.pathname));

  // Body classes (CSS depends on these exact class names).
  useEffect(() => {
    const c = document.body.classList;
    c.toggle('high-contrast', a11y.highContrast); c.toggle('large-text', a11y.largeText); c.toggle('reduce-motion', a11y.reduceMotion);
    c.toggle('sidebar-hidden', sidebarHidden); c.toggle('is-transitioning', busy);
    if (resolved) c.toggle('is-landing', isLanding);
  }, [a11y, sidebarHidden, busy, isLanding, resolved]);

  // Per-route side effects: document title and ?group= deep link.
  useEffect(() => {
    if (!resolved) return;
    document.title = resolved.docTitle ?? resolved.title;

    // Dynamic favicon matching the official site (Services vs eCrime)
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      if (resolved.page === 'ecrime') {
        favicon.href = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%2715%27 fill=%27%23666%27/%3E%3Cpath d=%27M11 10q5-5 10 0q-5 5-10 0%27 fill=%27none%27 stroke=%27white%27 stroke-width=%273%27/%3E%3C/svg%27';
      } else {
        favicon.href = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%2715%27 fill=%27%23008755%27/%3E%3Cpath d=%27M9 16.5l4.5 4.5 9-9%27 fill=%27none%27 stroke=%27white%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%27';
      }
    }

    if (resolved.page === 'directory') {
      const groupId = new URLSearchParams(route.search).get('group');
      if (groupId && catalog.groups.some(g => g.id === groupId)) setServiceDialog({ mode: 'group', id: groupId });
    }
  }, [route.key, catalog]); // eslint-disable-line react-hooks/exhaustive-deps

  // After a route transition, move focus to the visible page heading.
  useEffect(() => {
    if (busy || !focusPending) return;
    setFocusPending(false);
    if (document.querySelector('dialog[open]')) return;
    const heading = mainRef.current?.querySelector('#home-view:not(.hidden) h1, #directory-view:not(.hidden) h1, #ecrime-view:not(.hidden) h1');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }, [busy, focusPending]);

  async function showMyRequests() {
    setViewOverride('ecrime'); setMenuOpen(false);
    try {
      const [r, s] = await Promise.all([api.reports(), api.submissions()]);
      setReportList([
        ...r.reports.map(x => ({ reference: x.reference, label: `${x.person.fullName} · ${x.incident.category}` })),
        ...s.submissions.map(x => ({ reference: x.reference, label: x.serviceName }))
      ]);
    } catch { alert('Reports are unavailable.'); }
  }

  const closeSidebar = () => {
    if (matchMedia('(max-width:760px)').matches) setMenuOpen(false); else setSidebarHidden(true);
    setMenuFocus(n => n + 1);
  };
  const toggleMobileMenu = () => { if (sidebarHidden) { setSidebarHidden(false); setMenuExpanded(true); return; } setMenuOpen(!menuOpen); };
  const toggleContrast = () => setA11y(a => ({ ...a, highContrast: !a.highContrast }));

  // Which of the three main containers is visible (mirrors setViews()).
  const view = catalogError ? 'directory' : viewOverride ?? resolved?.view ?? 'ecrime';
  const activeCategory = resolved ? resolved.category : null;
  const pageActive = (id, base = '') => {
    const on = resolved?.page === id;
    return { className: [base, on && 'page-active'].filter(Boolean).join(' ') || undefined, 'aria-current': on ? 'page' : undefined };
  };
  const ctx = { catalog, navigate, openGroup, showInformation, startService, openHelp: () => setUtility('help'), onSearch, filters, setFilters };

  return (
    <IconContext.Provider value={referenceIcons}>
      <a className="skip" href="#main-content">Skip to main content</a>
      <div className="demo-banner" ref={bannerRef}><span>This application is rebuilt for agent testing</span></div>
      <div id="route-loader" className="route-loader" data-testid="route-loader" role="status" aria-live="polite" aria-atomic="true" hidden={!busy}>
        <div className="loader-orbit" aria-hidden="true"><img src={LOGO} alt="" width="133" height="47" /></div>
        <p id="route-loader-text">Loading…</p>
      </div>
      <div className="shell" inert={busy}>
        <aside className={`sidebar ${menuOpen ? 'menu-open' : ''}`}>
          <div className="sidebar-brand">
            <a className="brand" href="/app/home" aria-label="Home" onClick={link('/app/home')}><img className="brand-logo" src={LOGO} width="133" height="47" alt="Dubai Police logo" data-testid="sidebar-logo" /></a>
            <button id="sidebar-close" aria-label="Close sidebar" title="Close sidebar" onClick={closeSidebar}>
              <svg className="ico collapse" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="3.5" /><path d="M9.5 4v16" /></svg>
            </button>
          </div>
          <nav aria-label="Services navigation">
            <a href="/app/home" id="home-nav" data-testid="home-nav" onClick={link('/app/home')} {...pageActive('home')}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.5 11.5 12 4l8.5 7.5M6 10v9.5h12V10" /><path d="M10 19.5v-5h4v5" /></svg><span>Home</span>
            </a>
            <a href="/app/dashboard" id="dashboard-nav" data-testid="dashboard-nav" onClick={link('/app/dashboard')} {...pageActive('dashboard')}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="m12 13 4-4M6.5 17h11" /></svg><span>Dashboard</span>
            </a>
            <button className="services-toggle" id="services-toggle" aria-expanded={servicesOpen} aria-controls="category-nav" onClick={() => setServicesOpen(o => !o)}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></svg>
              <strong>Services</strong>
              <svg className="ico chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div id="category-nav" className={servicesOpen ? '' : 'hidden'}>
              {catalog?.sidebar.map((c, i) => {
                const href = `/app/services${c.id === 'all' ? '' : '#' + c.id}`;
                const selected = activeCategory === c.id;
                return (
                  <a key={c.id} href={href} data-category={c.id} data-testid={`category-${c.id}`} className={selected ? 'active' : undefined} aria-current={selected ? 'page' : undefined}
                    onClick={e => { e.preventDefault(); setFilters({ query: '', audience: 'All' }); navigate(href); }}>
                    <Icon index={i} /><span>{c.name}</span>
                  </a>
                );
              })}
            </div>
            <a href="/app/services/ecrime" id="ecrime-nav" onClick={link('/app/services/ecrime')}>Reporting E-Crime</a>
            <button id="reports-nav" onClick={showMyRequests}>▤ <span>My Requests</span></button>
          </nav>
          <div className="sidebar-note">
            <h3>Digitise your experience!</h3>
            <p>Continue as a guest to use services without signing in.</p>
            <button className="primary full" id="sidebar-guest" data-testid="sidebar-guest" onClick={signIn}>Continue as Guest</button>
          </div>
          <a href="/app/home/contactus" id="contact-nav" data-testid="contact-nav" onClick={link('/app/home/contactus')} {...pageActive('contact', 'contact-nav')}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4h3.5l1.8 4.6-2.3 1.4a10.5 10.5 0 0 0 5 5l1.4-2.3 4.6 1.8V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg><span>Contact Us</span>
          </a>
        </aside>

        <div className="workspace">
          <header className="topbar" aria-label="Site header">
            <button className="mobile-menu" id="mobile-menu" aria-label="Open services menu" aria-expanded={menuExpanded} ref={mobileMenuRef} onClick={toggleMobileMenu}>☰</button>
            <a className="header-home" href="/app/home" data-shell-route="/app/home" aria-label="Home" onClick={link('/app/home')}><img src={LOGO} width="133" height="47" alt="Dubai Police logo" /></a>
            <div className="top-actions" role="group" aria-label="Header controls">
              <button className="header-icon assistant-control" id="header-assistant" aria-label="Assistant" title="Assistant" aria-haspopup="dialog" onClick={() => setChatOpen(true)}>
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5c3.6 3.6 5.8 6.8 5.8 9.8a5.8 5.8 0 0 1-11.6 0c0-3 2.2-6.2 5.8-9.8z" fill="currentColor" stroke="none" /><path d="M12 8v9" stroke="#fff" /></svg>
              </button>
              <button className="header-icon happiness-control" id="header-happiness" aria-label="Happiness Meter" title="Happiness Meter" onClick={() => setUtility('happiness')}>
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M8.3 14c1 1.6 2.3 2.4 3.7 2.4s2.7-.8 3.7-2.4M9 9.6v.6M15 9.6v.6" /></svg>
              </button>
              <button className="header-icon" id="header-accessibility" aria-label="Accessibility options" title="Accessibility options" onClick={() => setUtility('accessibility')}>
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="4.4" r="1.7" fill="currentColor" stroke="none" /><path d="M11 8v6.2h5.2l2.6 5M8 11.2h5.2M7.6 13.4a5 5 0 1 0 6.9 6.4" /></svg>
              </button>
              <button className="header-pill" id="header-language" aria-label="Language: English" onClick={() => setUtility('language')}><span className="language-label">English</span><svg className="language-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg></button>
              <button className="header-sos" id="header-sos" aria-label="SOS" data-testid="header-sos" onClick={() => setUtility('sos')}>SOS</button>
              <button className="header-pill" id="header-signin" aria-label="Sign In" data-testid="header-signin" onClick={signIn}>
                {guestLabel ? 'Guest ' : 'Sign In '}
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="10" r="3" fill="currentColor" stroke="none" /><path d="M6.4 18c1.6-2.6 3.3-3.6 5.6-3.6s4 1 5.6 3.6" /></svg>
              </button>
            </div>
          </header>
          <div className="breadcrumb-bar">
            <span id="breadcrumb-section">Services</span><span className="slash">/</span>
            <strong id="breadcrumb-title">{resolved?.title ?? 'Reporting E-Crime'}</strong>
            <div className="breadcrumb-actions"><button id="contrast" aria-pressed={a11y.highContrast} aria-label="Toggle high contrast" onClick={toggleContrast}>◐</button></div>
          </div>

          <main id="main-content" ref={mainRef} aria-busy={busy}>
            <section id="home-view" className={view === 'home' ? '' : 'hidden'} aria-label="Home">
              {view === 'home' && resolved?.page === 'home' && <Home key={route.key} ctx={ctx} />}
              {view === 'home' && resolved?.page === 'dashboard' && <Dashboard key={route.key} ctx={ctx} />}
              {view === 'home' && resolved?.page === 'contact' && <Contact key={route.key} ctx={ctx} />}
            </section>
            <section id="directory-view" className={view === 'directory' ? '' : 'hidden'} aria-label="Services directory">
              {catalogError && (
                <div className="catalog-error"><h2>Service catalog unavailable</h2><p>Restart the local server to load the new services API, then refresh this page.</p><a href="/app/services/ecrime">Open Reporting E-Crime</a></div>
              )}
              {view === 'directory' && resolved?.page === 'directory' && <Directory key={route.key} ctx={ctx} category={resolved.category} />}
              {view === 'directory' && resolved?.page === 'service' && <ServiceForm key={route.key} ctx={ctx} service={resolved.service} />}
            </section>
            <Ecrime hidden={view !== 'ecrime'} reportList={reportList} setReportList={setReportList} />
          </main>

          <Dialog id="guest-dialog" aria-labelledby="guest-title" open={!!guestDialog} onClose={() => setGuestDialog(null)}>
            <div className="guest-mark" aria-hidden="true">◇</div>
            <h2 id="guest-title">Sign In</h2>
            <p>Continue as a guest to browse and use services without signing in.</p>
            <button id="continue-guest" className="primary full" data-testid="continue-guest" onClick={() => guestDialog?.onContinue()}>Continue as Guest</button>
          </Dialog>
          <ServicesAssistant open={chatOpen} onOpenChange={setChatOpen} onViewService={chatView} onStartService={chatStart} />
          <UtilityDialog kind={utility} onClose={() => setUtility(null)} navigate={navigate} a11y={a11y} toggleContrast={toggleContrast}
            toggleLargeText={() => setA11y(a => ({ ...a, largeText: !a.largeText }))} toggleReduceMotion={() => setA11y(a => ({ ...a, reduceMotion: !a.reduceMotion }))} />
          {catalog && <ServiceDialog catalog={catalog} state={serviceDialog} onClose={() => setServiceDialog(null)} openGroup={openGroup} showInformation={showInformation} startService={startService} />}
          {!catalog && <dialog id="service-dialog" aria-labelledby="service-dialog-title"><div id="service-dialog-content" /></dialog>}
          <footer><span>Services Portal © 2026</span><span>All rights reserved.</span></footer>
        </div>
      </div>
    </IconContext.Provider>
  );
}
