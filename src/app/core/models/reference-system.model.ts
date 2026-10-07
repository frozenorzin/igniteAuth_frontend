export interface ReferenceSystem {
  id: number;
  name: string;
  type: string;
  version: string;
  status: string;
  createdAt: string;
  subsystems?: Subsystem[];
}

export interface Subsystem {
  id?: number;
  name: string;
  type?: string;
  status?: string;
}