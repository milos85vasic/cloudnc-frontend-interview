import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable, scan, mergeMap, tap, BehaviorSubject } from 'rxjs';
import { Machine, MachineStatusFromWebSocket } from '../interfaces/machine.interface';

@Injectable({
  providedIn: 'root',
})
export class MachinesService {
  
  private allEvents$ = new BehaviorSubject<MachineStatusFromWebSocket[]>([]);
  private machinesCache$ = new BehaviorSubject<{ [machineId: string]: Machine }>({});

  constructor(private socket: Socket, private httpClient: HttpClient) {}

  public getMachineStatusChanges$(): Observable<MachineStatusFromWebSocket[]> {
    return this.socket
      .fromEvent<MachineStatusFromWebSocket, 'MACHINE_STATUS_CHANGES'>('MACHINE_STATUS_CHANGES')
      .pipe(
        tap((event) => {
        
          // Update the list of all events:
          const currentEvents = this.allEvents$.getValue();
          this.allEvents$.next([...currentEvents, event]);

          // Fetch machine details if it's a new machine:
          const machineId = event.id;
          if (!this.machinesCache$.getValue()[machineId]) {
            this.fetchMachineDetails(machineId).subscribe((machine) => {
              const currentCache = this.machinesCache$.getValue();
              this.machinesCache$.next({ ...currentCache, [machineId]: machine });
            });
          }
      }),
      scan(
        (statuses, status) => [...statuses, status], [] as MachineStatusFromWebSocket[]
      )
    );
  }

  private fetchMachineDetails(machineId: string): Observable<Machine> {
    return this.httpClient.get<Machine>(`http://localhost:3000/machines/${machineId}`);
  }

  public getAllEvents$(): Observable<MachineStatusFromWebSocket[]> {
    return this.allEvents$.asObservable();
  }

  public getMachineDetails$(machineId: string): Observable<Machine | undefined> {
    return this.machinesCache$.pipe(
      mergeMap((cache) => {
        if (cache[machineId]) {
          return [cache[machineId]];
        } else {
          return this.fetchMachineDetails(machineId).pipe(
            tap((machine) => {
              const currentCache = this.machinesCache$.getValue();
              this.machinesCache$.next({ ...currentCache, [machineId]: machine });
            })
          );
        }
      })
    );
  }
}