export interface ReferenceSystem {
  referenceSystemId: number;
  systemName: string;
  systemType: string;
  systemVersion: string;
  description: string;
  status: string;
  createdAt: string;
  subsystems: Subsystem[];
  policies: ReferencePolicy[];
}

export interface Subsystem {
  subSystemId: number;
  referenceSystemId: number;
  name: string;
  domain: string;
  description: string;
  status: string;
}

export interface ReferencePolicy {
  policyId: number;
  referenceSystemId: number;
  policyName: string;
  policyType: string;
  allowedIntents: string[];
  allowedCommands: string[];
  allowedTargets: string[];
}