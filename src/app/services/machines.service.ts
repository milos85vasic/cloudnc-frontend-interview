import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, scan } from 'rxjs';
import { MachineStatusFromWebSocket } from '../interfaces/machine.interface';

@Injectable({
  providedIn: 'root'
})
export class MachinesService {

  constructor(private socket: Socket) { }

  public getMachineStatusChanges$(): Observable<MachineStatusFromWebSocket[]> {
    return this.socket
    .fromEvent<MachineStatusFromWebSocket, 'MACHINE_STATUS_CHANGES'>('MACHINE_STATUS_CHANGES')
    .pipe(
      scan((statuses, status) => [...statuses, status], [] as MachineStatusFromWebSocket[])
    );
  }
}
