import { useEffect, useRef, useState } from 'react';
import { serviceFields } from '../lib/services.mjs';
import { api } from '../api.js';
import { emit } from '../util.js';

const fileMeta = file => JSON.stringify({ name: file.name, size: file.size, type: file.type });

function sampleValue(f) {
  if (f.disabled) return f.value;
  if (f.type === 'select') return f.options[0];
  if (f.type === 'number') return '000000';
  if (f.type === 'checkbox') return 'yes';
  if (f.type === 'file') return JSON.stringify({ name: 'sample.txt', size: 128, type: 'text/plain' });
  if (f.type === 'email') return 'name@example.test';
  if (f.type === 'textarea') return 'Sample request details.';
  return f.syntheticId ? 'DEMO-ID-001' : 'Sample value';
}

function Field({ f, value, onChange }) {
  const v = f.disabled ? f.value : value ?? '';
  const common = { id: `service-${f.id}`, name: f.id, 'data-testid': `field-${f.id}`, required: f.required, disabled: f.disabled };
  if (f.type === 'checkbox') {
    return <div className="field wide"><label className="checkbox"><input {...common} type="checkbox" value="yes" checked={v === 'yes'} onChange={e => onChange(e.target.checked ? 'yes' : '')} />{f.label}</label></div>;
  }
  let control;
  if (f.type === 'file') {
    control = <>
      <input {...common} type="file" accept=".txt,.png,.jpg,.jpeg,.pdf" onChange={e => { const file = e.target.files[0]; onChange(file ? fileMeta(file) : ''); }} />
      <small className="hint" id={`metadata-${f.id}`}>{v ? `Selected: ${JSON.parse(v).name}` : 'No file selected'}</small>
    </>;
  } else if (f.type === 'textarea') {
    control = <textarea {...common} maxLength={3000} placeholder="Enter details" value={v} onChange={e => onChange(e.target.value)} />;
  } else if (f.type === 'select') {
    control = <select {...common} value={v} onChange={e => onChange(e.target.value)}><option value="">Select an option</option>{(f.options ?? []).map(o => <option key={o}>{o}</option>)}</select>;
  } else {
    const extra = f.type === 'number' ? { min: '0', step: '1' } : { maxLength: 3000 };
    control = <input {...common} type={f.type} value={v} {...extra} placeholder={f.type === 'email' ? 'name@example.test' : 'Enter value'} onChange={e => onChange(e.target.value)} />;
  }
  return (
    <div className={`field ${f.type === 'textarea' ? 'wide' : ''}`}>
      <label htmlFor={`service-${f.id}`}>{f.label}{f.required && <span className="required">*</span>}</label>
      {control}
      {f.note && <small className="hint">{f.note}</small>}
    </div>
  );
}

/** React port of directory.js renderService()/submitService(). */
export default function ServiceForm({ ctx, service: s }) {
  const { navigate } = ctx;
  const [variant, setVariant] = useState(s.variants?.[0].id ?? null);
  const [values, setValues] = useState({});
  const [formStep, setFormStep] = useState(0);
  const [errors, setErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const titleRef = useRef(null), errorsRef = useRef(null), receiptRef = useRef(null);
  const [renderKey, setRenderKey] = useState(0);
  const rerender = () => setRenderKey(k => k + 1);
  const fields = serviceFields(s, variant);
  const set = (key, value) => setValues(v => ({ ...v, [key]: value }));

  useEffect(() => {
    if (receipt) return;
    titleRef.current?.focus();
    emit('demo:service-step', { serviceId: s.id, variant, step: formStep + 1 });
  }, [s.id, variant, formStep, receipt, renderKey]);
  useEffect(() => { if (errors) errorsRef.current?.focus(); }, [errors]);
  useEffect(() => { if (receipt) receiptRef.current?.focus(); }, [receipt]);

  const show = list => setErrors({ list, at: Date.now() });

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    const bad = [];
    for (const f of fields) {
      const v = f.disabled ? f.value : values[f.id] ?? '';
      if (f.required && !v.trim()) bad.push(`Enter ${f.label}.`);
      if (v && f.syntheticId && !/^DEMO[-_A-Za-z0-9]*$/.test(v)) bad.push('Use a DEMO-prefixed synthetic identity marker.');
      if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.test$/.test(v)) bad.push('Use an email ending in .test.');
      if (v && f.type === 'number' && !/^\d{1,20}$/.test(v)) bad.push(`Use a nonnegative test number for ${f.label}.`);
    }
    if (!values.demoOnly) bad.push('Confirm the details are for testing purposes.');
    if (formStep && !values.consent) bad.push('Confirm this request is not submitted to any authority.');
    if (bad.length) { show(bad); return; }
    if (!formStep) { setErrors(null); setFormStep(1); rerender(); return; }
    setSubmitting(true);
    try {
      const { demoOnly, consent, ...fieldValues } = values;
      const response = await api.createSubmission({ serviceId: s.id, variant, values: fieldValues, demoOnly: !!demoOnly, consent: !!consent });
      const r = await response.json();
      if (!response.ok) { show(Object.values(r.errors ?? { error: r.error })); return; }
      setReceipt(r);
      emit('demo:service-submitted', { serviceId: r.serviceId, id: r.id, reference: r.reference });
    } catch { show(['Service unavailable. Please try again.']); }
    finally { setSubmitting(false); }
  }

  function secondary() {
    if (submitting) return;
    setErrors(null);
    if (formStep) { setFormStep(0); rerender(); return; }
    const next = { ...values };
    fields.forEach(f => { next[f.id] = sampleValue(f); });
    next.demoOnly = true;
    setValues(next);
    rerender();
  }

  return (
    <>
      <div className="directory-header">
        <p className="eyebrow">SERVICE</p><h1>{s.name}</h1><p>{s.description}</p>
        <button className="text-button" id="back-directory" onClick={() => navigate('/app/services')}>← All services</button>
      </div>
      {s.variants && (
        <div className="form-tabs" role="tablist" aria-label="Service variant">
          {s.variants.map(v => (
            <button key={v.id} role="tab" aria-selected={variant === v.id} className={variant === v.id ? 'selected' : ''} data-variant={v.id} data-testid={`variant-${v.id}`}
              onClick={() => { if (submitting) return; setVariant(v.id); setFormStep(0); setErrors(null); rerender(); }}>{v.name}</button>
          ))}
        </div>
      )}
      <section className="info-card observed-form" key={renderKey}>
        {receipt ? (
          <div className="receipt" data-testid="service-receipt">
            <div className="receipt-mark" aria-hidden="true">✓</div>
            <h2 tabIndex={-1} id="service-receipt-title" ref={receiptRef}>Request received</h2>
            <strong className="reference">{receipt.reference}</strong>
            <p>This request was not sent to any government authority.<br />No fee, SMS or appointment was processed.</p>
            <button className="primary" id="another-service" onClick={() => navigate('/app/services')}>Back to services</button>
          </div>
        ) : <>
          <p className="section-label">{formStep === 0 ? 'APPLICATION DETAILS' : 'REVIEW'}</p>
          <h2 tabIndex={-1} id="service-form-title" ref={titleRef}>{formStep === 0 ? 'Enter your details' : 'Review your request'}</h2>
          <div id="service-errors" role="alert" tabIndex={-1} className={`errors ${errors ? '' : 'hidden'}`} ref={errorsRef}>
            {errors && <ul>{errors.list.map((e, i) => <li key={i}>{e}</li>)}</ul>}
          </div>
          <form id="service-form" noValidate data-testid="service-form" onSubmit={submit}>
            {formStep === 0 ? <>
              <div className="fields">{fields.map(f => <Field key={`${variant}-${f.id}`} f={f} value={values[f.id]} onChange={v => set(f.id, v)} />)}</div>
              <label className="checkbox"><input type="checkbox" id="service-demoOnly" data-testid="service-demoOnly" checked={!!values.demoOnly} onChange={e => set('demoOnly', e.target.checked)} />I confirm these details are for testing purposes.</label>
            </> : <>
              <dl>{fields.map(f => <div key={f.id}><dt>{f.label}</dt><dd>{f.disabled ? f.value : values[f.id]}</dd></div>)}</dl>
              <label className="checkbox"><input type="checkbox" id="service-consent" data-testid="service-consent" checked={!!values.consent} onChange={e => set('consent', e.target.checked)} />I understand this request is not submitted to any government authority.</label>
            </>}
            <div className="service-actions">
              <button type="button" className="secondary" id="service-back" onClick={secondary}>{formStep ? 'Back' : 'Fill sample data'}</button>
              <button className="primary" type="submit" data-testid={formStep ? 'service-submit' : 'service-next'} disabled={submitting}>{formStep ? 'Submit' : 'Next'}</button>
            </div>
          </form>
        </>}
      </section>
    </>
  );
}
