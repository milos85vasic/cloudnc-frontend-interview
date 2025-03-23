import { uuid } from './uuid.interface';

export enum MachineStatus {
  ON = 'on',
  OFF = 'off',
}

/*
  When retrieving a machine from the REST endpoint (`/machines/:machineId`)
  you'll get an object of the following type:
*/
export interface Machine {
  id: uuid;
  name: string;
}

/*
  Extension:
*/
export interface MachineWithDefaults extends Machine {
  statusChanges: MachineStatusFromWebSocket[];
  status: MachineStatus;
}

/*
  When subscribing to the websocket and the event 'MACHINE_STATUS_CHANGES'
  you'll get events of the following type:
*/
export interface MachineStatusFromWebSocket {
  id: uuid;
  status: MachineStatus;
}
