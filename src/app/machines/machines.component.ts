import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MachineStatus } from '../interfaces/machine.interface';
import { MachineStatusComponent } from './machine-status/machine-status.component';
import { MachinesService } from '../services/machines.service';
import { Machine } from '../interfaces/machine.interface';

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
  public machines$!: Observable<Machine[]>;
  private subscriptions: Subscription = new Subscription();

  constructor(private machinesService: MachinesService) {}

  ngOnInit(): void {
    
    const webSocketSubscription = this.machinesService
      .getMachineStatusChanges$()
      .subscribe();

    const machinesSubscription = this.machinesService
      .getAllCachedMachines$()
      .subscribe();

    this.subscriptions.add(webSocketSubscription);
    this.subscriptions.add(machinesSubscription);

    this.machines$ = this.machinesService.getAllCachedMachines$();
  }

  ngOnDestroy(): void {

    this.subscriptions.unsubscribe();
  }
}