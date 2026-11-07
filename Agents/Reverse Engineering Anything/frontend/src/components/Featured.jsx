import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';
import MotionButton from './MotionButton.jsx';

const FEATURED = ['circulars-and-travel-bans','submit-an-inquiry','police-clearance-certificate','hq-entry-permit','fines-inquiry-and-payment'];
const pageSize = () => innerWidth <= 760 ? 1 : innerWidth <= 1450 ? 2 : 3;

/** React port of landing.js renderFeatured(). */
export default function Featured({ catalog, startService, showInformation }) {
  const all = catalog.groups.flatMap(g => g.services);
  const services = FEATURED.map(id => all.find(s => s.id === id)).filter(Boolean);
  const [size, setSize] = useState(pageSize);
  const [page, setPage] = useState(0);
  useEffect(() => { const r = () => setSize(pageSize()); addEventListener('resize', r); return () => removeEventListener('resize', r); }, []);
  const pages = Math.max(1, Math.ceil(services.length / size));
  const current = Math.min(page, pages - 1);

  return (
    <>
      <div className="featured-heading">
        <h2>Most Used Services</h2>
        <div className="carousel-controls">
          <button className="carousel-arrow" data-prev aria-label="Previous most used services" disabled={current === 0} onClick={() => setPage(current - 1)}>‹</button>
          <div className="carousel-dots" role="group" aria-label="Featured services pages">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`carousel-dot ${current === i ? 'selected' : ''}`} data-page={i} aria-label={`Featured services page ${i + 1}`} aria-pressed={current === i} onClick={() => setPage(i)} />
            ))}
          </div>
          <button className="carousel-arrow" data-next aria-label="Next most used services" disabled={current === pages - 1} onClick={() => setPage(current + 1)}>›</button>
        </div>
      </div>
      <div className="featured-grid">
        {services.slice(current * size, (current + 1) * size).map((s, i) => (
          <article key={s.id} className="featured-card">
            <div className="featured-summary">
              <span className="tile-icon"><Icon index={i + 1} name={s.name} /></span>
              <div><h3>{s.name}</h3><p>{s.description}</p></div>
            </div>
            <div className="featured-actions">
              <MotionButton className="primary" data-featured-start={s.id} data-testid={`featured-start-${s.id}`} aria-label={`Start Service: ${s.name}`} onClick={() => startService(s.id)}>Start Service</MotionButton>
              <MotionButton className="secondary" tone="gray" arrow={false} data-featured-info={s.id} aria-label={`Information: ${s.name}`} onClick={() => showInformation(s.id)}>
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.5" /><path d="M12 11v6M12 7.4v.4" /></svg>Information
              </MotionButton>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
