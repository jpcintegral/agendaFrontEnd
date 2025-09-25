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
import { MatDialog } from '@angular/material/dialog';
import { DetalleEventoComponent, DetalleEventoData } from '../detalle-evento/detalle-evento.component';
import { MatSelect } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';


type EventStatus = 'aprobado' | 'considerando' | 'pendiente' | 'cancelado';

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
    MatFormFieldModule,
    
  ]
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];
  userRole : any = [];
  userArreas: any = []
  currentUserId = 5; // ejemplo
  selectedStatus: EventStatus | 'todos' = 'todos';
  filterStatus: 'all' | 'aprobado' | 'considerando' | 'pendiente' | 'cancelado' = 'all';
  eventosConflicto: any[] = []

  


  // Contadores de estados
  statusCounts: Record<EventStatus, number> = {
    aprobado: 0,
    considerando: 0,
    pendiente: 0,
    cancelado: 0
  };

  constructor(private eventService: EventService, private auth :AuthService, private realtime: RealtimeService,private snackBar: MatSnackBar, private dialog : MatDialog ) {}

  ngOnInit() {

  this.userRole = this.auth.getRolUser();
  this.userArreas = this.auth.getAreasUsuario();
    this.loadEvents();

    // Real-time updates
    this.realtime.connect();
    this.realtime.joinRoom('secretarias');
    this.realtime.onEventApproved().subscribe(event => this.loadEvents());
    this.realtime.onEventConsidered().subscribe(event => this.loadEvents());
    this.realtime.onEventCanceled().subscribe(event => this.loadEvents());
    this.onTabChange(0);
  }


    loadEvents() {
     
    this.eventService.getEvents().subscribe((res: any) => {
    let eventos = res.data || [];
        console.log("rol desde eventos",this.userRole);
       console.log("areas desde venetos",this.userArreas); 

    if (this.userRole === 'Areas' ) {
      console.log("entro al filtro")
    // Filtrar solo los eventos que tengan al menos una área del usuario
      
      const userAreaIds = this.userArreas; // Devuelve un array de IDs de áreas del usuario
      eventos = (eventos as any[]).filter(event =>
        event.areas.some((area: any) => userAreaIds.includes(area.id))
      );
    
    }else{
      console.log("no entro al filtro");
    }
     this.events = eventos;
    // Inicializar contadores
    this.statusCounts = { aprobado: 0, considerando: 0, pendiente: 0, cancelado: 0 };

    // Incrementar contadores
    this.events.forEach(event => {
      const key = event.status as EventStatus;
      if (this.statusCounts.hasOwnProperty(key)) {
        this.statusCounts[key]++;
      }
    });

    // Ordenar: por estado primero, luego por fecha
    const statusOrder: EventStatus[] = ['aprobado', 'considerando', 'pendiente', 'cancelado'];
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
    return true; // event.assignedUsers?.some((u: any) => u.id === this.currentUserId);
  }

approveEvent(event: any) {
  this.eventService.approveEvent(event.documentId).subscribe({
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
        this.snackBar.open(` ${conflictMsg}`, 'Ver detalles', { duration: 5000 });

        // Mostrar en consola los eventos que causan conflicto
        console.log('Eventos en conflicto:', errorDetails.conflicts);

        // Si quieres, también puedes mostrar en pantalla los detalles resumidos
        this.eventosConflicto = errorDetails.conflicts;
       this.abrirConflictosModal();
      } else {
        // Otros errores genéricos
        const msg = err.error?.error?.message || 'Ocurrió un error al aprobar el evento';
        this.snackBar.open(msg, 'OK', { duration: 3000 });
      }
    }
  });
}

private cancelEvent(idEvent: string) {
  if (!idEvent) return;

  if (confirm('¿Seguro que deseas cancelar este evento?')) {
    this.eventService.updateEvent(idEvent, { status: 'cancelado' }).subscribe({
      next: (res: any) => {
        console.log('Evento cancelado:', res);
        this.snackBar.open('Evento cancelado con éxito', 'Cerrar', { duration: 3000 });

        // Refrescar lista de eventos
        this.loadEvents();
      },
      error: err => {
        console.error('Error al cancelar evento:', err);
        this.snackBar.open('Ocurrió un error al cancelar el evento', 'Cerrar', { duration: 3000 });
      }
    });
  }
}

private considerarEvent(idEvent: string) {
  if (!idEvent) return;

  if (confirm('¿Seguro que deseas considerar este evento?')) {
    this.eventService.updateEvent(idEvent, { status: 'considerando' }).subscribe({
      next: (res: any) => {
        console.log('Evento actualizado:', res);
        this.snackBar.open('Evento actualizado con éxito', 'Cerrar', { duration: 3000 });

        // Refrescar lista de eventos
        this.loadEvents();
      },
      error: err => {
        console.error('Error al cancelar evento:', err);
        this.snackBar.open('Ocurrió un error al cancelar el evento', 'Cerrar', { duration: 3000 });
      }
    });
  }
}

 
private deleteEvent(idEvent: string) {
  if (!idEvent) return;

  if (confirm('¿Seguro que deseas eliminar este evento?')) {
    this.eventService.deleteEvent(idEvent).subscribe({
      next: (res: any) => {
        console.log('Evento eliminado:', res);
        this.snackBar.open('Evento eliminado con éxito', 'Cerrar', { duration: 3000 });
        this.loadEvents();
      },
      error: err => {
        console.error('Error al eliminar evento:', err);
        this.snackBar.open('Ocurrió un error al eliminar el evento', 'Cerrar', { duration: 3000 });
      }
    });
  }
}


  getStatusClass(status: EventStatus): string {
    switch (status) {
      case 'aprobado': return 'status-approved';
      case 'considerando': return 'status-considered';
      case 'pendiente': return 'status-pending';
      case 'cancelado': return 'status-rejected';
      default: return '';
    }
  }

  onTabChange(index: number) {
  switch(index) {
    case 0: this.selectedStatus = 'aprobado'; break;
    case 1: this.selectedStatus = 'pendiente'; break;
    case 2: this.selectedStatus = 'considerando'; break;
    case 3: this.selectedStatus = 'todos'; break;
    case 4: this.selectedStatus = 'cancelado'; break;
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

  onStatusChange(evento: any, action: any) {
 const value = action.value;
  const select: MatSelect = action.source; // este es el mat-select que disparó el evento

 
  switch (value) {
    case 'ver':
      this.detalleEvento(evento,select);
      break;
    case 'aprobar':
      this.approveEvent(evento);
       select.writeValue(null);
      break;
     case 'considerando':
      this.considerarEvent(evento.documentId);
       select.writeValue(null);
      break;
    case 'cancelar':
      this.cancelEvent(evento.documentId);
       select.writeValue(null)
      break;
    case 'eliminar':
      this.deleteEvent(evento.documentId);
       select.writeValue(null);
      break;
  }
}

 detalleEvento(evento : any, elemento : any ){
  // Abrir detalle de un evento individual
 const dialogref=  this.dialog.open(DetalleEventoComponent, {
    width: '600px',
    data: { eventos: evento, isConflict: false } as DetalleEventoData
  });

  dialogref.afterClosed().subscribe(() => {
    // Reinicia el mat-select al cerrar el modal
   elemento.writeValue(null);
  });
 }

  abrirConflictosModal(){
     console.log("llamar modal")
    if (this.eventosConflicto.length > 0) {
  this.dialog.open(DetalleEventoComponent, {
    width: '700px',
    data: { eventos: this.eventosConflicto, isConflict: true } as DetalleEventoData
  });
}
  }

}
