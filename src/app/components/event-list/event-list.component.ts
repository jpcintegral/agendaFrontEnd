import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { RealtimeService } from '../../services/realtime.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


type EventStatus = 'aprobado' | 'considerando' | 'pendiente' | 'rechazado';

interface ApproveEventResponse {
  result: 'approved' | 'conflict' | string;
  message: string;
  conflicts?: any[];
}

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ]
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];
  userRole = 'presidente'; // o 'presidente', dinámico según sesión
  currentUserId = 5; // ejemplo
  selectedStatus: EventStatus | 'todos' = 'todos';
  filterStatus: 'all' | 'aprobado' | 'considerando' | 'pendiente' | 'rechazado' = 'all';

  


  // Contadores de estados
  statusCounts: Record<EventStatus, number> = {
    aprobado: 0,
    considerando: 0,
    pendiente: 0,
    rechazado: 0
  };

  constructor(private eventService: EventService, private realtime: RealtimeService,private snackBar: MatSnackBar ) {}

  ngOnInit() {
    this.loadEvents();

    // Real-time updates
    this.realtime.connect();
    this.realtime.joinRoom('secretarias');
    this.realtime.onEventApproved().subscribe(event => this.loadEvents());
    this.realtime.onEventConsidered().subscribe(event => this.loadEvents());
  }

  loadEvents() {
    this.eventService.getEvents().subscribe((res: any) => {
      this.events = res.data || [];

      // Inicializar contadores
      this.statusCounts = { aprobado: 0, considerando: 0, pendiente: 0, rechazado: 0 };

      // Incrementar contadores
      this.events.forEach(event => {
        const key = event.status as EventStatus;
        if (this.statusCounts.hasOwnProperty(key)) {
          this.statusCounts[key]++;
        }
      });

      // Ordenar: por estado primero, luego por fecha
      const statusOrder: EventStatus[] = ['aprobado', 'considerando', 'pendiente', 'rechazado'];
      this.events.sort((a, b) => {
        const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        if (statusDiff !== 0) return statusDiff;
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      });

      // Asignar número de orden
      this.events.forEach((event, i) => event.order = i + 1);

      // Aplicar filtro inicial
      this.filterEvents();
    });
  }

 // Filtrar eventos por tab
filterEvents() {
  if (this.selectedStatus === 'todos') {
    this.filteredEvents = [...this.events];
  } else {
    this.filteredEvents = this.events.filter(e => e.status === this.selectedStatus);
  }

  // Recalcular order según el grupo filtrado
  this.updateOrderBadges();
}

// Recalcula el número de orden de cada evento en filteredEvents
updateOrderBadges() {
  // Primero ordena por fecha dentro del grupo
  this.filteredEvents.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  // Luego asigna el order
  this.filteredEvents.forEach((event, index) => event.order = index + 1);
}


  isUserAssigned(event: any): boolean {
    return event.assignedUsers?.some((u: any) => u.id === this.currentUserId);
  }

approveEvent(event: any) {
  this.eventService.approveEvent(event.id).subscribe({
    next: (res: any) => {
      // Si la aprobación fue exitosa (200 OK)
      const msg = res?.message || 'Evento aprobado correctamente';
      this.snackBar.open(msg, 'OK', { duration: 3000 });
      // Actualizar la lista de eventos
      this.loadEvents();
    },
    error: (err: any) => {
      // Revisamos si el error viene con detalles de conflicto
      const errorDetails = err.error?.error?.details;
      if (errorDetails?.result === 'conflict') {
        const conflictMsg = err.error?.error?.message || 'Conflicto de horarios con otro evento aprobado';
        this.snackBar.open(`⚠️ ${conflictMsg}`, 'Ver detalles', { duration: 5000 });

        // Mostrar en consola los eventos que causan conflicto
        console.log('Eventos en conflicto:', errorDetails.conflicts);

        // Si quieres, también puedes mostrar en pantalla los detalles resumidos
        const conflictTitles = errorDetails.conflicts.map((c: any) => `• ${c.title} (${new Date(c.startDateTime).toLocaleString()})`).join('\n');
        alert(`Conflictos detectados:\n${conflictTitles}`);
      } else {
        // Otros errores genéricos
        const msg = err.error?.error?.message || 'Ocurrió un error al aprobar el evento';
        this.snackBar.open(msg, 'OK', { duration: 3000 });
      }
    }
  });
}



  getStatusClass(status: EventStatus): string {
    switch (status) {
      case 'aprobado': return 'status-approved';
      case 'considerando': return 'status-considered';
      case 'pendiente': return 'status-pending';
      case 'rechazado': return 'status-rejected';
      default: return '';
    }
  }

  onTabChange(index: number) {
  switch(index) {
    case 0: this.selectedStatus = 'todos'; break;
    case 1: this.selectedStatus = 'aprobado'; break;
    case 2: this.selectedStatus = 'considerando'; break;
    case 3: this.selectedStatus = 'pendiente'; break;
    case 4: this.selectedStatus = 'rechazado'; break;
  }
  this.filterEvents();
}

  applyFilter() {
    if (this.filterStatus === 'all') {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(e => e.status === this.filterStatus);
    }
  }
  
    // Contadores por estado
  countByStatus(status: string) {
    return this.events.filter(e => e.status === status).length;
  }

  onStatusChange(event: any, action: string) {
  switch (action) {
    case 'ver':
      //this.viewEvent(event);
      break;
    case 'aprobar':
      //this.approveEvent(event);
      break;
    case 'cancelar':
      //this.cancelEvent(event);
      break;
    case 'eliminar':
      //this.deleteEvent(event);
      break;
  }
}

}
