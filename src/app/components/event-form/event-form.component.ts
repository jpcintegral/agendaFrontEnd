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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DetalleEventoComponent, DetalleEventoData } from '../detalle-evento/detalle-evento.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';



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
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ]
})
export class EventFormComponent implements OnInit {
  @Input() event: any;
  form!: FormGroup;
  areas: any[] = [];
  today = new Date();
  durationHours = 1;
  loading = false; 
  eventosConflicto: any[] =[];
  userRole: any = [];

  constructor(private fb: FormBuilder, private eventService: EventService, private router: Router,private snackBar: MatSnackBar, private dialog : MatDialog,private auth :AuthService ) {
  
  }
 
  
   
  
  ngOnInit() {
    
    this.userRole = this.auth.getRolUser();
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
      areas: [this.event?.areas?.map((a: any) => a.id) || []],

      needsBudget: [this.event?.needsBudget || 'no', Validators.required],
      estimatedBudget: [this.event?.estimatedBudget || null]
    });

    // 🔹 Mostrar/ocultar validación del monto según la selección
    this.form.get('needsBudget')?.valueChanges.subscribe(val => {
      const budgetCtrl = this.form.get('estimatedBudget');
      if (val === 'si') {
        budgetCtrl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        budgetCtrl?.clearValidators();
        budgetCtrl?.setValue(null);
      }
      budgetCtrl?.updateValueAndValidity();
    });



    this.eventService.getAreas().subscribe((res: any) => {
      this.areas = res.data.map((a: any) => ({ id: a.id, name: a.name, documentId: a.documentId }));
    });

    ['startDate', 'startTime', 'endDate', 'endTime'].forEach(ctrl =>
      this.form.get(ctrl)?.valueChanges.subscribe(() =>{ 
        this.updateDuration()
        this.eventosConflicto = [];
      })
    );

    this.updateDuration();
  }

 private combineDateTime(date: any, time: string): Date | null {
  if (!date || !time) return null;

  const [hours, minutes] = time.split(':').map(Number);

  let dt: Date;
  if (typeof date === 'string') {
    const d = new Date(date);
    dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
  } else if (date instanceof Date) {
    dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  } else {
    return null;
  }

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
    if (start && end && end > start) {
      this.durationHours = +((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2);
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

     if (this.durationHours <= 0) {
    alert('La duración del evento debe ser mayor a 0 horas.');
    return;
  }
    const payload = {
      title: this.form.value.title,
      description: this.form.value.description,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      type: this.form.value.type,
      durationHours: this.durationHours,
      areas: this.form.value.areas,
      needsBudget: this.form.value.needsBudget === 'si',
      estimatedBudget: this.form.value.estimatedBudget
    };

    this.loading = true; // 🔹 activar loader

    const request$ = this.event?.id
      ? this.eventService.updateEvent(this.event.id, payload)
      : this.eventService.createEvent(payload);

    request$.subscribe({
      next: res => {
        console.log('Evento guardado', res);
        this.router.navigate(['/events']);
      },
      error: err => {
         if (err.status === 409) {
          //console.log('Conflictos:', err.error.error?.details?.conflicts);
          this.eventosConflicto = err.error.error?.details?.conflicts;
          this.snackBar.open('Conflicto de horario detectado', 'Cerrar', { duration: 4000 });
         }
        this.loading = false;
      },
   
      complete: () => (this.loading = false) // 🔹 desactivar loader
    });
  }

   abrirConflictosModal(){
     console.log("llamar modal")
    if (this.eventosConflicto.length > 0) {
  this.dialog.open(DetalleEventoComponent, {
    width: '700px',
    data: { eventos: this.eventosConflicto, isConflict: true,userRol : this.userRole } as DetalleEventoData
  });
}
  }
}
