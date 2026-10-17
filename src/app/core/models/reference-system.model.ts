export interface AuthenticatedUser {
  authId: string;
}

export interface RegisteredSubsystem {
  subsystemId: string;
  name: string;
}

export interface ValidIntent {
  subsystemId: string;
  intent: string;
}

export interface ValidCommand {
  subsystemId: string;
  command: string;
}

export interface IntentCommandMapping {
  subsystemId: string;
  intent: string;
  commands: string[];
}

export interface ReferenceSystem {
  referenceSystemId: number;
  systemName: string;
  systemType: string;
  systemVersion: string;
  description: string;
  status: string;
  createdAt: string;
  authenticatedUser?: AuthenticatedUser;
  registeredSubsystems?: RegisteredSubsystem[];
  validIntents?: ValidIntent[];
  validCommands?: ValidCommand[];
  intentCommandMappings?: IntentCommandMapping[];
  subsystems?: Subsystem[];
  policies?: ReferencePolicy[];
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