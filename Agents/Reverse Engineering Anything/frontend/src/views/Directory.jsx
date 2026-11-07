import HelpButton from '../components/HelpButton.jsx';
import Featured from '../components/Featured.jsx';
import Catalog from '../components/Catalog.jsx';

export default function Directory({ ctx, category }) {
  const { catalog, openGroup, startService, showInformation, openHelp, filters, setFilters } = ctx;
  const name = catalog.sidebar.find(c => c.id === category).name;
  return (
    <>
      <div className="directory-header welcome-row"><div><h1>{category === 'all' ? 'Marhaba' : name}</h1></div><HelpButton onHelp={openHelp} /></div>
      <section id="directory-featured" className="featured-section" aria-label="Most Used Services">
        <Featured catalog={catalog} startService={startService} showInformation={showInformation} />
      </section>
      <section id="directory-catalog" aria-label="Filter services">
        <Catalog catalog={catalog} category={category} query={filters.query} audience={filters.audience} openGroup={openGroup}
          onChange={s => setFilters({ query: s.query, audience: s.audience })} />
      </section>
    </>
  );
}
