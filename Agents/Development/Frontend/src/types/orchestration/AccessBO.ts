export type CapabilityIdBO =
  'ecrime' | 'antifraud' | 'saraab' | 'oyoon' | 'interpol' | 'sps' | 'moi';
export type RoleBO = 'commander' | 'intake' | 'investigator' | 'dispatcher' | 'liaison' | 'auditor';

export interface UserBO {
  id: string;
  name: string;
  email: string;
  role: RoleBO;
  expiresAt: number;
}

export interface CapabilityBO {
  id: CapabilityIdBO;
  name: string;
  shortName: string;
  description: string;
  agent: string;
  icon: 'FileSearch' | 'Network' | 'ScanFace' | 'Camera' | 'Globe' | 'Building' | 'Waypoints';
}
