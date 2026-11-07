import type { CapabilityIdBO } from './AccessBO.ts';

export interface CaseBO {
  id: string;
  capability: CapabilityIdBO;
  title: string;
  fraudType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'triaged' | 'investigating' | 'awaiting-approval' | 'approved';
  indicators: string[];
  createdAt: string;
  assignedUnit: string;
  emirates: string[];
  summary: string;
  findings: string[];
  recommendedAction: string;
  evidence: string;
  confidence: number;
  loss: number;
  deadline: string;
  approval?: { officer: string; time: string; note: string; decision: 'approved' | 'rejected' };
  saraabScore?: number;
}
