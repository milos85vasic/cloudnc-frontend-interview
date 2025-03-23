import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MachineStatus } from '../interfaces/machine.interface';
import { MachineStatusComponent } from './machine-status/machine-status.component';
import { MachinesService } from '../services/machines.service';
import { MachineWithDefaults } from '../interfaces/machine.interface';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MachineStatusComponent,
    MatListModule,
    MatBadgeModule,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class MachinesComponent implements OnInit {
  public MachineStatus = MachineStatus;
  public machines$!: Observable<MachineWithDefaults[]>;

  constructor(private machinesService: MachinesService) {}

  ngOnInit(): void {
    this.machinesService.getMachineStatusChanges$().subscribe();
    this.machines$ = this.machinesService.getAllCachedMachines$().pipe(
      map((machines) =>
        machines.map((machine) => ({
          ...machine,
          statusChanges: [],
          status: MachineStatus.OFF,
        }))
      )
    );
  }
}