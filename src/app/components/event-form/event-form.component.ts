import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EventFormComponent implements OnInit {
  @Input() event: any;
  form!: FormGroup;
  areas: any[] = [];
  today = new Date();
  durationHours = 1;

  constructor(private fb: FormBuilder, private eventService: EventService) {}

  ngOnInit() {
    // inicializar controles con valores válidos
    const startDateObj = this.event?.startDateTime ? new Date(this.event.startDateTime) : null;
    const endDateObj = this.event?.endDateTime ? new Date(this.event.endDateTime) : null;

    this.form = this.fb.group({
      title: [this.event?.title || '', Validators.required],
      description: [this.event?.description || ''],
      startDate: [startDateObj, Validators.required],
      startTime: [startDateObj ? this.formatTime(startDateObj) : '', Validators.required],
      endDate: [endDateObj, Validators.required],
      endTime: [endDateObj ? this.formatTime(endDateObj) : '', Validators.required],
      type: [this.event?.type || 'escolar', Validators.required],
      durationHours: [this.event?.durationHours || 1, [Validators.required, Validators.min(0)]],
      areas: [this.event?.areas?.map((a: any) => a.id) || []]
    });

    this.eventService.getAreas().subscribe((res: any) => {
       console.log('Áreas obtenidas:', res);
      this.areas = res.data.map((a: any) => ({ id: a.id, name: a.name, documentId: a.documentId }));
    });

    // suscribirse a cambios
    ['startDate', 'startTime', 'endDate', 'endTime'].forEach(ctrl =>
      this.form.get(ctrl)?.valueChanges.subscribe(() => this.updateDuration())
    );

    // calcular duración inicial
    this.updateDuration();
  }

  private combineDateTime(date: any, time: string): Date | null {
    if (!(date instanceof Date) || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const dt = new Date(date);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  }

  private formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  updateDuration() {
    const start = this.combineDateTime(this.form.value.startDate, this.form.value.startTime);
    const end = this.combineDateTime(this.form.value.endDate, this.form.value.endTime);
    console.log('start', start, 'end', end);

    if (start && end && end > start) {
      this.durationHours = +( (end.getTime() - start.getTime()) / (1000 * 60 * 60) ).toFixed(2);
    } else {
      this.durationHours = 0;
    }

    this.form.get('durationHours')?.setValue(this.durationHours, { emitEvent: false });
  }

  submit() {
    if (!this.form.valid) return;

    const start = this.combineDateTime(this.form.value.startDate, this.form.value.startTime);
    const end = this.combineDateTime(this.form.value.endDate, this.form.value.endTime);

    if (!start || !end || end <= start) {
      alert('La fecha/hora de fin debe ser posterior a la de inicio.');
      return;
    }

    const payload = {
      
        title: this.form.value.title,
        description: this.form.value.description,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        type: this.form.value.type,
        durationHours: this.durationHours,
        areas: this.form.value.areas
    }

    if (this.event?.id) {
      this.eventService.updateEvent(this.event.id, payload).subscribe(res => console.log('Evento actualizado', res));
    } else {
      this.eventService.createEvent(payload).subscribe(res => console.log('Evento creado', res));
    }
  }
}
