import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-approve-event',
  templateUrl: './approve-event.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ]
})
export class ApproveEventComponent {
  @Input() event: any;

  constructor(private eventService: EventService) {}

  approve() {
     console.log('Aprobando evento:', this.event);
    this.eventService.approveEvent(this.event.id).subscribe(() => {
      alert('Evento aprobado');
    });
  }
}
