import { useState } from 'react';
import HelpButton from '../components/HelpButton.jsx';
import Featured from '../components/Featured.jsx';
import Catalog from '../components/Catalog.jsx';
import { Icon } from '../components/Icon.jsx';

export default function Home({ ctx }) {
  const { catalog, navigate, openGroup, startService, showInformation, openHelp, onSearch } = ctx;
  const [search, setSearch] = useState('');
  const link = path => e => { e.preventDefault(); navigate(path); };
  return (
    <>
      <div className="welcome-row"><div><h1>Marhaba</h1></div><HelpButton onHelp={openHelp} /></div>
      <section id="home-featured" className="featured-section" aria-label="Most Used Services">
        <Featured catalog={catalog} startService={startService} showInformation={showInformation} />
      </section>
      <section className="home-search-section">
        <h2>How can we help you today?</h2>
        <form id="home-search" className="home-search" role="search" onSubmit={e => { e.preventDefault(); onSearch(search); }}>
          <label htmlFor="home-service-search">Search Services</label>
          <div>
            <input id="home-service-search" data-testid="home-service-search" placeholder="Search services, certificates or reports" maxLength={200} value={search} onChange={e => setSearch(e.target.value)} />
            <button className="primary" type="submit">Search Services</button>
          </div>
        </form>
      </section>
      <section className="home-categories">
        <div className="featured-heading"><h2>Explore Services</h2><a href="/app/services" data-home-route="/app/services" onClick={link('/app/services')}>View all services →</a></div>
        <div className="home-category-grid">
          {catalog.sidebar.filter(c => c.id !== 'all').map((c, i) => (
            <a key={c.id} className="home-category" href={`/app/services#${c.id}`} data-home-route={`/app/services#${c.id}`} data-testid={`home-category-${c.id}`} onClick={link(`/app/services#${c.id}`)}>
              <span className="tile-icon"><Icon index={i + 1} /></span>
              <h3>{c.name}</h3>
              <span>{`${catalog.groups.filter(g => g.category === c.id).length} service groups →`}</span>
            </a>
          ))}
        </div>
      </section>
      <section id="home-catalog" className="home-service-groups" aria-label="Filter services">
        <Catalog catalog={catalog} openGroup={openGroup} />
      </section>
    </>
  );
}
