import { useEffect, useRef, useState } from 'react';
import Dialog from './Dialog.jsx';
import MotionButton from './MotionButton.jsx';
import { Icon, ChooserIcon } from './Icon.jsx';
import { cleanSnapshot } from '../util.js';

/** React port of directory.js openGroup() (chooser) and showInformation(). */
export default function ServiceDialog({ catalog, state, onClose, openGroup, showInformation, startService }) {
  const mode = state?.mode;
  return (
    <Dialog id="service-dialog" aria-labelledby="service-dialog-title" open={!!state} onClose={onClose}
      className={mode === 'group' ? 'service-chooser' : mode === 'info' ? 'service-information' : undefined}
      aria-describedby={mode === 'group' ? 'chooser-description' : undefined}>
      <div id="service-dialog-content">
        {mode === 'group' && <Chooser key={state.id} catalog={catalog} id={state.id} onClose={onClose} showInformation={showInformation} startService={startService} />}
        {mode === 'info' && <Information key={state.id} catalog={catalog} id={state.id} onClose={onClose} openGroup={openGroup} startService={startService} />}
      </div>
    </Dialog>
  );
}

function Chooser({ catalog, id, onClose, showInformation, startService }) {
  const g = catalog.groups.find(g => g.id === id);
  const [share, setShare] = useState(null);
  const scrollRef = useRef(null), linkRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [id]);
  useEffect(() => { if (share && !share.copied) { linkRef.current?.focus(); linkRef.current?.select(); } }, [share]);
  if (!g) return null;

  async function copy() {
    const link = new URL('/app/services', location.origin);
    link.searchParams.set('group', g.id);
    try {
      if (!navigator.clipboard?.writeText) throw Error();
      await navigator.clipboard.writeText(link.href);
      setShare({ href: link.href, copied: true });
    } catch { setShare({ href: link.href, copied: false }); }
  }

  return <>
    <div className="chooser-tools">
      <button className="chooser-tool" id="chooser-share" aria-label="Share" title="Copy link" onClick={copy}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8 10.5 7.5-4M8 13.5l7.5 4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>
      <button className="chooser-tool" data-close aria-label="Close" onClick={onClose}>×</button>
    </div>
    <div className="chooser-scroll" ref={scrollRef}>
      <header className="chooser-heading">
        <span className="chooser-mark"><Icon index={catalog.sidebar.findIndex(c => c.id === g.category)} /></span>
        <h2 id="service-dialog-title">{g.name}</h2>
        <p id="chooser-description">{g.description}</p>
      </header>
      <div className={`chooser-share-feedback ${share ? '' : 'hidden'}`} id="chooser-share-feedback">
        <p id="chooser-share-status" role="status">{share ? (share.copied ? 'Link copied.' : 'Copy this link.') : ''}</p>
        <label htmlFor="chooser-share-link">Link</label>
        <input id="chooser-share-link" readOnly value={share?.href ?? ''} ref={linkRef} />
      </div>
      <h3 className="chooser-section-title">Choose Service Type</h3>
      <div className="chooser-services">
        {g.services.map((s, i) => (
          <article key={s.id} className="chooser-service" data-testid={`chooser-row-${s.id}`}>
            <span className="chooser-service-icon"><ChooserIcon id={s.id} index={i} /></span>
            <div className="chooser-service-copy"><h3>{s.name}</h3><p title={s.description}>{s.description}</p></div>
            <div className="chooser-service-actions">
              <MotionButton className="primary" data-start={s.id} aria-label={`Start Service: ${s.name}`} data-testid={`start-${s.id}`} onClick={() => startService(s.id)}>Start Service</MotionButton>
              <MotionButton className="secondary" tone="gray" arrow={false} data-information={s.id} aria-label={`Information: ${s.name}`} onClick={() => showInformation(s.id)}>ⓘ Information</MotionButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  </>;
}

function Information({ catalog, id, onClose, openGroup, startService }) {
  const s = catalog.groups.flatMap(g => g.services).find(s => s.id === id);
  if (!s) return null;
  const fields = s.variants ? s.variants.flatMap(v => v.fields.map(f => `${v.name}: ${f.label}`)) : s.fields.map(f => f.label);
  return <>
    <div className="dialog-top">
      <div><p className="section-label">SERVICE INFORMATION</p><h2 id="service-dialog-title">{s.name}</h2></div>
      <button className="dialog-close" data-close aria-label="Close" onClick={onClose}>×</button>
    </div>
    <p className="dialog-description">{s.description}</p>
    <h3>Required information</h3>
    {fields.length ? <ul className="field-inventory">{fields.map((f, i) => <li key={i}>{f}</li>)}</ul> : <p className="dialog-description">Details are provided when you start the service.</p>}
    {s.informationSnapshot && <><h3>Service details</h3><p className="dialog-description">{cleanSnapshot(s.informationSnapshot)}</p></>}
    {s.pageSnapshot && !fields.length && <><h3>Service details</h3><p className="dialog-description">{cleanSnapshot(s.pageSnapshot)}</p></>}
    <div className="service-actions">
      <button className="secondary" id="information-back" onClick={() => openGroup(s.groupId)}>Back to service group</button>
      <MotionButton className="primary" id="information-start" onClick={() => startService(s.id)}>Start Service</MotionButton>
    </div>
  </>;
}
