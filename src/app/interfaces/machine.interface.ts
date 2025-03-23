import { uuid } from './uuid.interface';

export enum MachineStatus {
  ON = 'on',
  OFF = 'off',
}

export interface Machine {
  id: uuid;
  name: string;
  status: MachineStatus;
  statusChanges: MachineStatusFromWebSocket[];
}

export interface MachineStatusFromWebSocket {
  id: uuid;
  status: MachineStatus;
}
