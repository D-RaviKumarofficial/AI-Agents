export const categories = ['Online fraud', 'Account compromise', 'Online harassment', 'Identity misuse', 'Other cyber incident'];
export const sample = {
  demoOnly: true,
  person: { fullName: 'Alex Morgan', email: 'alex@example.test', phone: '+971 50 000 0000', residency: 'Resident' },
  incident: { category: 'Online fraud', date: '2026-10-01', platform: 'Online marketplace', description: 'A seller on an online marketplace asked for a payment and never delivered the item.', amount: '250' },
  evidence: [{ name: 'sample-conversation.txt', size: 128, type: 'text/plain' }],
  consent: true
};
export function validateReport(report) {
  const errors = {};
  if (!report || typeof report !== 'object' || Array.isArray(report)) return { form: 'A report object is required.' };
  if (report.demoOnly !== true) errors.demoOnly = 'Confirm the details entered are for testing purposes.';
  const p = report.person ?? {}, i = report.incident ?? {};
  if (typeof p.fullName !== 'string' || p.fullName.trim().length < 2 || p.fullName.length > 100) errors.fullName = 'Enter your full name (2–100 characters).';
  if (typeof p.email !== 'string' || !/^[^\s@]+@[^\s@]+\.test$/.test(p.email) || p.email.length > 200) errors.email = 'Use an email ending in .test.';
  if (typeof p.phone !== 'string' || !/^\+?[\d\s()-]{7,25}$/.test(p.phone)) errors.phone = 'Enter a valid phone number (7–25 characters).';
  if (!['Resident', 'Visitor', 'Citizen'].includes(p.residency)) errors.residency = 'Choose a residency type.';
  if (!categories.includes(i.category)) errors.category = 'Choose an incident category.';
  if (typeof i.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(i.date) || Number.isNaN(Date.parse(i.date)) || new Date(i.date).toISOString().slice(0,10) !== i.date || i.date > new Date().toISOString().slice(0,10)) errors.date = 'Choose a valid date that is not in the future.';
  if (typeof i.platform !== 'string' || i.platform.trim().length < 2 || i.platform.length > 150) errors.platform = 'Enter a platform (2–150 characters).';
  if (typeof i.description !== 'string' || i.description.trim().length < 20 || i.description.length > 3000) errors.description = 'Describe the incident in 20–3000 characters.';
  if (i.amount !== '' && i.amount !== undefined && (!/^\d+(\.\d{1,2})?$/.test(String(i.amount)) || Number(i.amount) > 10000000)) errors.amount = 'Enter a nonnegative amount up to 10,000,000.';
  if (!Array.isArray(report.evidence) || report.evidence.length > 5 || report.evidence.some(f => !f || typeof f.name !== 'string' || f.name.length > 200 || !Number.isInteger(f.size) || f.size < 0 || f.size > 5 * 1024 * 1024 || !['text/plain', 'image/png', 'image/jpeg', 'application/pdf'].includes(f.type))) errors.evidence = 'Use up to five TXT, PNG, JPG or PDF files, each at most 5 MB.';
  if (report.consent !== true) errors.consent = 'Confirm this report is not submitted to any authority.';
  return errors;
}
export function sanitizeReport(r) {
  return { demoOnly: true, person: Object.fromEntries(['fullName','email','phone','residency'].map(k=>[k,r.person[k].trim()])), incident: Object.fromEntries(['category','date','platform','description','amount'].map(k=>[k,String(r.incident[k] ?? '').trim()])), evidence: r.evidence.map(({name,size,type})=>({name,size,type})), consent: true };
}
