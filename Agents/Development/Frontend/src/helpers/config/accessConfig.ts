import type {
  CapabilityBO,
  CapabilityIdBO,
  RoleBO,
  UserBO,
} from '@/types/orchestration/AccessBO.ts';

export const CAPABILITIES: readonly CapabilityBO[] = [
  {
    id: 'ecrime',
    name: 'e-Crime Platform',
    shortName: 'e-Crime',
    description: 'Complaint intake, indicator extraction and automated triage.',
    agent: 'Triage Agent',
    icon: 'FileSearch',
  },
  {
    id: 'antifraud',
    name: 'Anti-Fraud Centre',
    shortName: 'Anti-Fraud',
    description: 'Connected investigations, fraud clusters and bank advisories.',
    agent: 'Pattern Cluster Agent',
    icon: 'Network',
  },
  {
    id: 'saraab',
    name: 'SARAAB',
    shortName: 'SARAAB',
    description: 'Deepfake analysis, anomaly findings and evidence provenance.',
    agent: 'Triage Agent',
    icon: 'ScanFace',
  },
  {
    id: 'oyoon',
    name: 'Oyoon',
    shortName: 'Oyoon',
    description: 'Camera match review and officer-approved patrol dispatch.',
    agent: 'Router Agent',
    icon: 'Camera',
  },
  {
    id: 'interpol',
    name: 'Interpol Notices',
    shortName: 'Interpol',
    description: 'Yellow, Red and Black notice cross-checks for officer review.',
    agent: 'Missing Person Agent',
    icon: 'Globe',
  },
  {
    id: 'sps',
    name: 'Smart Police Stations',
    shortName: 'Smart Stations',
    description: '24/7 report follow-through and citizen status updates.',
    agent: 'Triage Agent',
    icon: 'Building',
  },
  {
    id: 'moi',
    name: 'MOI Coordination',
    shortName: 'Cross-Emirate',
    description: 'Shared case files, jurisdiction review and legal deadlines.',
    agent: 'Router Agent',
    icon: 'Waypoints',
  },
];

export const ROLE_LABELS: Record<RoleBO, string> = {
  commander: 'Commanding Officer',
  intake: 'Intake Officer',
  investigator: 'Fraud Investigator',
  dispatcher: 'Control Room Officer',
  liaison: 'International Liaison',
  auditor: 'Read-only Auditor',
};

const ROLE_ACCESS: Record<RoleBO, readonly CapabilityIdBO[]> = {
  commander: ['ecrime', 'antifraud', 'saraab', 'oyoon', 'interpol', 'sps', 'moi'],
  intake: ['ecrime', 'sps'],
  investigator: ['ecrime', 'antifraud', 'saraab'],
  dispatcher: ['oyoon', 'moi'],
  liaison: ['interpol', 'moi'],
  auditor: ['ecrime', 'antifraud', 'saraab', 'oyoon', 'interpol', 'sps', 'moi'],
};

export function canView(user: UserBO | null, capability: CapabilityIdBO): boolean {
  return Boolean(
    user && user.expiresAt > Date.now() && ROLE_ACCESS[user.role].includes(capability),
  );
}

export function canApprove(user: UserBO | null, capability: CapabilityIdBO): boolean {
  return Boolean(user && user.role !== 'auditor' && canView(user, capability));
}
