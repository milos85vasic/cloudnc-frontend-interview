import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MachineStatus } from '../../interfaces/machine.interface';
import { MachineStatusComponent } from '../machine-status/machine-status.component';
import { MachinesService } from '../../services/machines.service';
import { AsyncPipe, DatePipe, CommonModule } from '@angular/common';
import { Machine } from '../../interfaces/machine.interface';

@Component({
  selector: 'app-machine',
  templateUrl: './machine.component.html',
  styleUrls: ['./machine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  
  imports: [
    
    MachineStatusComponent, MatCardModule, 
    AsyncPipe, DatePipe, CommonModule
  ],
})
export class MachineComponent implements OnInit, OnDestroy {
  public MachineStatus = MachineStatus;
  public machine$!: Observable<Machine | undefined>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    
    private route: ActivatedRoute,
    private machinesService: MachinesService

  ) {}

  ngOnInit(): void {

    const machineId = this.route.snapshot.paramMap.get('id');

    if (machineId) {

      this.machine$ = this.machinesService.getMachineDetails$(machineId);

      const webSocketSubscription = this.machinesService
        .getMachineStatusChanges$()
        .subscribe();

      this.subscriptions.add(webSocketSubscription);
    }
  }

  ngOnDestroy(): void {
 
    this.subscriptions.unsubscribe();
  }
}