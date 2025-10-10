import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter , ChangeDetectorRef  } from '@angular/core';
import { CommonModule, formatDate, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import {
  CalendarEvent,
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarDayModule,
  CalendarView,
  CalendarCommonModule,
} from 'angular-calendar';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgIf } from '@angular/common';
import { isSameDay } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { DetalleEventoComponent, DetalleEventoData } from '../detalle-evento/detalle-evento.component';

type EventStatus = 'aprobado' | 'considerando' | 'pendiente' | 'cancelado';
registerLocaleData(localeEs);

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarCommonModule,
    CalendarMonthModule,
    CalendarWeekModule,
    CalendarDayModule,
    MatButtonModule,
    MatButtonToggleModule,
    NgIf,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() selectedDate: Date = new Date();
  @Input() userRole : any = [];
  @Input() userArreas: any = []
  
  @Output() daySelected = new EventEmitter<Date>();
  locale: string = 'es';

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  CalendarView = CalendarView;
  refresh: Subject<void> = new Subject<void>();

  // Para abrir/cerrar los eventos de un día
  openDay: Date | null = null;

   constructor (private dialog : MatDialog, private changeDetectorRef: ChangeDetectorRef ){}

  ngOnChanges(changes: SimpleChanges): void {
    this.viewDate = this.selectedDate || new Date();
    this.refresh.next();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({ date }: { date: Date; events: CalendarEvent[] }) {
    // Alterna apertura/cierre del día
    if (this.openDay && isSameDay(this.openDay, date)) {
      this.openDay = null;
    } else {
      this.openDay = date;
    }
    this.viewDate = date;
    this.daySelected.emit(date);
    this.refresh.next();
  }

  eventsForOpenDay(): CalendarEvent[] {
    if (!this.openDay) return [];
    return this.events.filter(ev => isSameDay(ev.start, this.openDay!));
  }

  get currentMonth(): string {
    return formatDate(this.viewDate, 'MMMM yyyy', this.locale);
  }

  previous(): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
    } else if (this.view === CalendarView.Week) {
      this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() - 7));
    } else {
      this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() - 1));
    }
      this.changeDetectorRef.detectChanges();
  }

  next(): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
    } else if (this.view === CalendarView.Week) {
      this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() + 7));
    } else {
      this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() + 1));
    }

      this.changeDetectorRef.detectChanges();
    
  }

  today() {
    this.viewDate = new Date();
    window.location.reload();
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

   detalleEvento(evento : any, elemento : any ){
    // Abrir detalle de un evento individual
   const dialogref=  this.dialog.open(DetalleEventoComponent, {
      width: '600px',
      data: { eventos: evento, isConflict: false } as DetalleEventoData
    });
  }

   getApprovedEvents(): CalendarEvent[] {
      return this.events
        .filter(e => e.meta.originalEvent.status === 'aprobado') // Filtramos aquí usando meta
        .map(e => ({
          start: e.start, // esto ya viene del CalendarEvent
          end: e.end,
          title: e.title,
          color: e.color,
          meta: e.meta
        }));
    }
  
  getApprovedEventsForDay(): CalendarEvent[] {
      if (!this.openDay && !this.selectedDate) {
        return [];
      }
   
      const dayToFilter = new Date(this.openDay || this.selectedDate);
      dayToFilter.setHours(0, 0, 0, 0);

      let result = this.events
        .filter(e => e.meta?.originalEvent.status === 'aprobado')
        .filter(e => {
          const eventDate = new Date(e.start);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === dayToFilter.getTime();
        })
        .map(e => ({
          start: e.start,
          end: e.end,
          title: e.title,
          color: e.color,
          meta: e.meta
        }));
         return result;
    }



  }
