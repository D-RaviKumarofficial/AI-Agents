import { useEffect, useMemo, useState } from 'react';
import { audiences, filterGroups, audienceCounts } from '../lib/catalog-filter.mjs';
import { Icon } from './Icon.jsx';
import MotionButton from './MotionButton.jsx';
import { emit } from '../util.js';

/** React port of catalog-view.js mountCatalog(). */
export default function Catalog({ catalog, category = 'all', query: initialQuery = '', audience: initialAudience = 'All', openGroup, onChange }) {
  const [query, setQuery] = useState(initialQuery);
  const [audience, setAudience] = useState(initialAudience);
  const counts = useMemo(() => audienceCounts(catalog.groups, category), [catalog, category]);
  const groups = useMemo(() => filterGroups(catalog.groups, { category, audience, query }), [catalog, category, audience, query]);

  useEffect(() => {
    const state = { category, query, audience };
    onChange?.({ ...state });
    emit('demo:catalog-filtered', { ...state, count: groups.length, groupIds: groups.map(g => g.id) });
  }, [category, query, audience, groups]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <label htmlFor="catalog-search-input">Search Services</label>
          <div className="catalog-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
            <input id="catalog-search-input" data-testid="service-search" placeholder="Search" value={query} maxLength={200} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="audience-tabs" role="group" aria-label="Service audience">
          {audiences.map(a => (
            <button key={a} data-audience={a} data-testid={`filter-${a.toLowerCase()}`} aria-pressed={audience === a} className={audience === a ? 'selected' : ''} onClick={() => setAudience(a)}>
              <span className="filter-check" aria-hidden="true">✓</span>{`${a} (${counts[a]})`}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count" role="status" id="service-count">{`${groups.length} Results`}</p>
      <div className="service-grid" id="service-grid">
        {groups.length ? groups.map(g => (
          <article key={g.id} className="service-tile" data-testid={`group-${g.id}`} data-group-id={g.id}>
            <span className="tile-icon"><Icon index={catalog.sidebar.findIndex(c => c.id === g.category)} name={g.name} /></span>
            <h2>{g.name}</h2>
            <p title={g.description}>{g.description}</p>
            <div className="audience-label">{g.audiences.map(a => <span key={a}>{a}</span>)}</div>
            <MotionButton className="secondary" data-group={g.id} aria-label={`View: ${g.name}`} onClick={() => openGroup(g.id)}>View</MotionButton>
          </article>
        )) : <p className="catalog-empty">No matching services. Try a different search or filter.</p>}
      </div>
    </>
  );
}
