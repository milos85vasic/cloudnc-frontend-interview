import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable, map, scan, mergeMap, tap, BehaviorSubject } from 'rxjs';
import { MachineStatusFromWebSocket, Machine } from '../interfaces/machine.interface'

@Injectable({
  providedIn: 'root',
})
export class MachinesService {
  
  private machinesCache$ = new BehaviorSubject<{ [machineId: string]: Machine }>(
    JSON.parse(localStorage.getItem('machinesCache') || "{}") || {}
  );

  private allEvents$ = new BehaviorSubject<MachineStatusFromWebSocket[]>(
    JSON.parse(localStorage.getItem('allEvents') || "[]") || []
  );

  constructor(private socket: Socket, private httpClient: HttpClient) {}

  public getMachineStatusChanges$(): Observable<MachineStatusFromWebSocket[]> {
    
    return this.socket
      .fromEvent<MachineStatusFromWebSocket, 'MACHINE_STATUS_CHANGES'>('MACHINE_STATUS_CHANGES')
      .pipe(
        tap((event) => {
          
          const eventWithTimestamp = {
            ...event,
            timestamp: new Date().toISOString(),
          };

          const currentEvents = this.allEvents$.getValue();
          const updatedEvents = [...currentEvents, eventWithTimestamp];
          this.allEvents$.next(updatedEvents);
          localStorage.setItem('allEvents', JSON.stringify(updatedEvents));

          const machineId = event.id;
          const currentCache = this.machinesCache$.getValue();
          const existingMachine = currentCache[machineId];

          if (!existingMachine || !existingMachine.name) {
            
            this.fetchMachineDetails(machineId).subscribe((machine) => {
              
              const updatedMachine = {
                ...machine,
                status: event.status,
                statusChanges: [...(existingMachine?.statusChanges || []), eventWithTimestamp],
              };

              const updatedCache = {
                ...currentCache,
                [machineId]: updatedMachine,
              };

              this.machinesCache$.next(updatedCache);
              localStorage.setItem('machinesCache', JSON.stringify(updatedCache));
            });

          } else {

            const updatedMachine = {
              ...existingMachine,
              status: event.status,
              statusChanges: [...(existingMachine.statusChanges || []), eventWithTimestamp],
            };

            const updatedCache = {
              ...currentCache,
              [machineId]: updatedMachine,
            };

            this.machinesCache$.next(updatedCache);
            localStorage.setItem('machinesCache', JSON.stringify(updatedCache));
          }
        }),
        scan((acc, event) => [...acc, event], [] as MachineStatusFromWebSocket[])
      );
  }

  private fetchMachineDetails(machineId: string): Observable<Machine> {
    return this.httpClient.get<Machine>(`http://localhost:3000/machines/${machineId}`);
  }

  public getAllCachedMachines$(): Observable<Machine[]> {
    return this.machinesCache$.pipe(
      map((cache) => Object.values(cache))
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