export const CASE_STATUS_LABELS = {
  triaged: 'Triaged',
  investigating: 'Investigating',
  'awaiting-approval': 'Awaiting approval',
  approved: 'Approved',
} as const;

export function formatCaseTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  }).format(new Date(value));
}
