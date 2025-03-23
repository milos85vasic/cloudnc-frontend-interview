import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable, map, scan, mergeMap, tap, BehaviorSubject } from 'rxjs';
import { MachineStatusFromWebSocket, Machine } from '../interfaces/machine.interface'

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
          
          const currentEvents = this.allEvents$.getValue();
          this.allEvents$.next([...currentEvents, event]);

          const machineId = event.id;
          const currentCache = this.machinesCache$.getValue();
          const existingMachine = currentCache[machineId];

          const updatedMachine = {
            ...existingMachine,
            status: event.status,
            statusChanges: [...(existingMachine?.statusChanges || []), event], // Add the new event
          };

          this.machinesCache$.next({
            ...currentCache,
            [machineId]: updatedMachine,
          });
        }),
        
        scan((acc, event) => [...acc, event], [] as MachineStatusFromWebSocket[]) // Accumulate events into an array
      );
  }

  private fetchMachineDetails(machineId: string): Observable<Machine> {
    return this.httpClient.get<Machine>(`http://localhost:3000/machines/${machineId}`);
  }

  public getAllCachedMachines$(): Observable<Machine[]> {
    return this.machinesCache$.pipe(
      map((cache) => Object.values(cache)) // Convert the cache object to an array of machines
    );
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