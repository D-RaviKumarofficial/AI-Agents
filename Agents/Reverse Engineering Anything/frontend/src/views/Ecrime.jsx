import { Fragment, useEffect, useRef, useState } from 'react';
import { sample, categories, validateReport } from '../lib/report.mjs';
import { api } from '../api.js';
import { emit } from '../util.js';

const labels = ['Basic details', 'Incident', 'Evidence', 'Review'];
const titles = ['Your basic details', 'Tell us what happened', 'Add evidence', 'Review your report'];
const descriptions = ['No sign-in needed. Provide your contact details.', 'Describe the online incident.', 'Optional: attach supporting files. Only their names, sizes and types are recorded.', 'Check the details below before submitting.'];
const stepFields = [['fullName', 'email', 'phone', 'residency', 'demoOnly'], ['category', 'date', 'platform', 'description', 'amount'], ['evidence']];
const blank = () => ({ demoOnly: false, person: { fullName: '', email: '', phone: '', residency: '' }, incident: { category: '', date: '', platform: '', description: '', amount: '' }, evidence: [], consent: false });

function Review({ title, values }) {
  return (
    <section className="review-group"><h3>{title}</h3>
      <dl>{Object.entries(values).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || 'Not provided'}</dd></div>)}</dl>
    </section>
  );
}

/** React port of app.js – the Reporting E-Crime wizard. Stays mounted so progress survives navigation. */
export default function Ecrime({ hidden, reportList, setReportList }) {
  const [data, setData] = useState(blank);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [focusToken, setFocusToken] = useState(0);
  const titleRef = useRef(null), errorsRef = useRef(null), receiptRef = useRef(null), fileRef = useRef(null), listRef = useRef(null);

  const [renderKey, setRenderKey] = useState(0);
  const goStep = (n, focus = true) => { setErrors(null); setStep(n); setRenderKey(k => k + 1); if (focus) setFocusToken(t => t + 1); };
  const setPerson = (k, v) => setData(d => ({ ...d, person: { ...d.person, [k]: v } }));
  const setIncident = (k, v) => setData(d => ({ ...d, incident: { ...d.incident, [k]: v } }));

  useEffect(() => { if (focusToken) titleRef.current?.focus(); }, [focusToken]);
  useEffect(() => { if (!receipt) emit('demo:step', { step: step + 1, name: labels[step] }); }, [step, receipt]);
  useEffect(() => { if (receipt) receiptRef.current?.focus(); }, [receipt]);
  useEffect(() => {
    if (!errors) return;
    const target = document.getElementById(Object.keys(errors)[0]);
    (target ?? errorsRef.current)?.focus();
  }, [errors]);
  useEffect(() => { if (reportList) listRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [reportList]);

  const invalid = key => errors && key in errors ? { 'aria-invalid': 'true', 'aria-describedby': 'errors' } : {};

  async function advance(e) {
    e.preventDefault();
    if (busy) return;
    const all = validateReport(data);
    const fields = stepFields[step] ?? Object.keys(all);
    const relevant = Object.fromEntries(Object.entries(all).filter(([key]) => fields.includes(key)));
    if (Object.keys(relevant).length) { setErrors(relevant); return; }
    if (step < 3) { goStep(step + 1); return; }
    setBusy(true);
    try {
      const response = await api.createReport(data);
      const value = await response.json();
      if (!response.ok) { setErrors(value.errors ?? { form: value.error }); return; }
      setErrors(null);
      setReceipt(value);
      emit('demo:submitted', { id: value.id, reference: value.reference });
    } catch { setErrors({ form: 'Service unavailable. Please try again.' }); }
    finally { setBusy(false); }
  }

  function addEvidence(e) {
    const files = [...e.target.files].map(f => ({ name: f.name, size: f.size, type: f.type }));
    const next = [...data.evidence, ...files];
    const errs = validateReport({ ...data, evidence: next });
    e.target.value = '';
    if (errs.evidence) { setErrors({ evidence: errs.evidence }); return; }
    setErrors(null);
    setData(d => ({ ...d, evidence: next }));
    setRenderKey(k => k + 1);
  }

  function loadSample() { if (busy) return; setData(structuredClone(sample)); setReceipt(null); goStep(0); }
  function newReport() { setData(blank()); setReceipt(null); goStep(0); }
  async function reset() {
    if (busy || !confirm('Delete all saved reports and clear this form?')) return;
    try { await api.reset(); setData(blank()); setReceipt(null); setReportList(null); goStep(0); }
    catch { alert('Could not clear data. Please try again.'); }
  }
  function download() {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${receipt.reference}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const today = new Date().toISOString().slice(0, 10);
  const textInput = (name, label, value, placeholder, onChange, type = 'text', hint = '', required = true) => (
    <div className="field">
      <label htmlFor={name}>{label}{required && <span className="required">*</span>}</label>
      <input id={name} name={name} data-testid={name} type={type} value={value} placeholder={placeholder} required={required}
        max={type === 'date' ? today : undefined} maxLength={type === 'text' ? 150 : undefined} onChange={e => onChange(name, e.target.value)} {...invalid(name)} />
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
  const selectInput = (name, label, value, options, onChange) => (
    <div className="field">
      <label htmlFor={name}>{label}<span className="required">*</span></label>
      <select name={name} id={name} data-testid={name} required value={value} onChange={e => onChange(name, e.target.value)} {...invalid(name)}>
        <option value="">Select an option</option>{options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  let body = null;
  if (step === 0) body = <>
    <div className="fields">
      {textInput('fullName', 'Full name', data.person.fullName, 'e.g. Alex Morgan', setPerson, 'text', 'Enter your full name.')}
      {textInput('email', 'Email address', data.person.email, 'alex@example.test', setPerson, 'email', 'Email must end in .test')}
      {textInput('phone', 'Mobile number', data.person.phone, '+971 50 000 0000', setPerson, 'tel', 'Enter your mobile number.')}
      {selectInput('residency', 'Residency type', data.person.residency, ['Resident', 'Visitor', 'Citizen'], setPerson)}
    </div>
    <label className="checkbox"><input id="demoOnly" name="demoOnly" data-testid="demoOnly" type="checkbox" checked={data.demoOnly} onChange={e => setData(d => ({ ...d, demoOnly: e.target.checked }))} {...invalid('demoOnly')} />I confirm the details entered are for testing purposes, not a real incident.</label>
  </>;
  if (step === 1) body = (
    <div className="fields">
      {selectInput('category', 'Incident category', data.incident.category, categories, setIncident)}
      {textInput('date', 'Incident date', data.incident.date, '', setIncident, 'date')}
      {textInput('platform', 'Platform / website', data.incident.platform, 'e.g. Online marketplace', setIncident)}
      {textInput('amount', 'Loss amount (AED)', data.incident.amount, '0.00', setIncident, 'text', 'Optional.', false)}
      <div className="field wide">
        <label htmlFor="description">Incident description<span className="required">*</span></label>
        <textarea id="description" name="description" data-testid="description" maxLength={3000} required placeholder="Describe the incident…" value={data.incident.description} onChange={e => setIncident('description', e.target.value)} {...invalid('description')} />
        <small className="hint">20–3000 characters. Never enter credentials or real financial information.</small>
      </div>
    </div>
  );
  if (step === 2) body = <>
    <div className="upload">
      <span aria-hidden="true">↑</span><h3>Choose files</h3><p>TXT, PNG, JPG or PDF · Up to 5 files · 5 MB per file</p>
      <label htmlFor="evidence">Select evidence</label>
      <input id="evidence" data-testid="evidence" type="file" accept=".txt,.png,.jpg,.jpeg,.pdf" multiple ref={fileRef} onChange={addEvidence} {...invalid('evidence')} />
    </div>
    <div id="file-list">
      {data.evidence.map((f, i) => (
        <div className="file-row" key={`${f.name}-${i}`}>
          <span>{`${f.name} `}<small>{`(${Math.ceil(f.size / 1024)} KB)`}</small></span>
          <button type="button" className="text-button" data-remove={i} aria-label={`Remove ${f.name}`} onClick={() => { setData(d => ({ ...d, evidence: d.evidence.filter((_, j) => j !== i) })); setRenderKey(k => k + 1); }}>Remove</button>
        </div>
      ))}
    </div>
    <p className="section-subtitle">File contents are not uploaded.</p>
  </>;
  if (step === 3) body = <>
    <Review title="Contact details" values={{ 'Full name': data.person.fullName, 'Email': data.person.email, 'Mobile': data.person.phone, 'Residency': data.person.residency }} />
    <Review title="Incident details" values={{ 'Category': data.incident.category, 'Date': data.incident.date, 'Platform': data.incident.platform, 'Description': data.incident.description, 'Loss amount (AED)': data.incident.amount }} />
    <Review title="Sample evidence" values={{ 'Files': data.evidence.map(f => f.name).join(', ') || 'None' }} />
    <label className="checkbox"><input id="consent" name="consent" data-testid="consent" type="checkbox" checked={data.consent} onChange={e => setData(d => ({ ...d, consent: e.target.checked }))} {...invalid('consent')} />I understand this report is not submitted to Dubai Police or any other authority.</label>
  </>;

  return (
    <div id="ecrime-view" className={hidden ? 'hidden' : ''}>
      <div className="page-heading">
        <div><p className="eyebrow">CRIMINAL REPORTS & COMPLAINTS</p><h1>Reporting E-Crime</h1><p className="subtitle">Report an online incident securely.</p></div>
        <span className="heading-icon" aria-hidden="true">◇</span>
      </div>
      <div className="content-grid">
        <section className="form-card" aria-label="Reporting form">
          <ol className="stepper" id="stepper" aria-label="Report progress">
            {labels.map((l, i) => (
              <li key={l} className={i === step ? 'current' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
                <span className="number">{i < step ? '✓' : i + 1}</span>{l}
              </li>
            ))}
          </ol>
          <div id="panel">
            {receipt ? (
              <div className="receipt" data-testid="receipt">
                <div className="receipt-mark" aria-hidden="true">✓</div>
                <p className="section-label">REPORT RECEIVED</p>
                <h2 id="receipt-title" tabIndex={-1} ref={receiptRef}>Report received</h2>
                <p>Your report has been received.</p>
                <strong className="reference" data-testid="reference">{receipt.reference}</strong>
                <p><strong>This is not a police report or an official case number.</strong><br />No SMS or email was sent.</p>
                <div className="actions">
                  <button className="secondary" id="download" data-testid="download-receipt" onClick={download}>Download receipt</button>
                  <button className="primary" id="new-report" data-testid="new-report" onClick={newReport}>Create another report</button>
                </div>
              </div>
            ) : <Fragment key={renderKey}>
              <p className="section-label">{`STEP ${step + 1} OF 4`}</p>
              <h2 id="step-title" tabIndex={-1} ref={titleRef}>{titles[step]}</h2>
              <p className="section-subtitle">{descriptions[step]}</p>
              <div id="errors" className={`errors ${errors ? '' : 'hidden'}`} role="alert" tabIndex={-1} ref={errorsRef}>
                {errors && <ul>{Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}</ul>}
              </div>
              <form id="report-form" noValidate data-testid="report-form" onSubmit={advance}>
                {body}
                <div className="actions">
                  {step ? <button type="button" className="secondary" id="back" data-testid="back" onClick={() => goStep(step - 1)}>← Back</button> : <span>Fields marked * are required</span>}
                  <button className="primary" type="submit" id="next" data-testid={step === 3 ? 'submit-report' : 'next'} disabled={busy}>
                    {busy ? 'Submitting…' : <>{step === 3 ? 'Submit report ' : 'Continue '}<span aria-hidden="true">→</span></>}
                  </button>
                </div>
              </form>
            </Fragment>}
          </div>
        </section>
        <aside className="info-column">
          <section className="info-card">
            <div className="info-heading"><span aria-hidden="true">▧</span><h2>About this service</h2></div>
            <p>This service allows individuals impacted by various types of criminal offenses to file complaints.</p>
            <dl>
              <div><dt>Service type</dt><dd>Online</dd></div>
              <div><dt>Authentication</dt><dd>Not required</dd></div>
              <div><dt>Submission</dt><dd>Online</dd></div>
              <div><dt>Fees</dt><dd>No payments</dd></div>
            </dl>
          </section>
          <section className="info-card">
            <h2>Before you begin</h2>
            <ul className="checklist">
              <li>Enter your full name and phone number</li>
              <li>Email must end in <code>.test</code></li>
              <li>Attach supporting evidence (optional)</li>
              <li>Review before submitting</li>
            </ul>
            <button className="secondary full" id="load-sample" data-testid="load-sample" onClick={loadSample}>Fill sample data <span aria-hidden="true">↗</span></button>
          </section>
          <section className="privacy-card">
            <h2>Your privacy</h2>
            <p>No passwords or identity documents are collected. Attachment contents are not uploaded.</p>
            <button className="text-button" id="reset" data-testid="reset-sandbox" onClick={reset}>Clear all data</button>
          </section>
        </aside>
      </div>
      <section id="report-list" className={`info-card ${reportList ? '' : 'hidden'}`} aria-label="Saved requests" ref={listRef}>
        <h2>My Requests</h2>
        <div id="reports-content">
          {reportList && (reportList.length ? reportList.map(r => (
            <div className="file-row" key={r.reference}><strong>{r.reference}</strong><span>{r.label}</span></div>
          )) : <p>No requests yet.</p>)}
        </div>
      </section>
    </div>
  );
}
