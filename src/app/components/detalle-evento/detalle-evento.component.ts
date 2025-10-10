import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EventService } from '../../services/event.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


export interface DetalleEventoData {
  eventos: any | any[];
  isConflict: boolean;
}



export interface DetalleEventoData {
  eventos: any | any[];
  isConflict: boolean;
  userRol : any;
}

@Component({
  selector: 'app-detalle-evento',
  standalone: true,
  imports: [MatDialogModule,CommonModule, MatButtonModule, MatCardModule, MatDividerModule,MatSnackBarModule],
  templateUrl: './detalle-evento.component.html',
  styleUrls: ['./detalle-evento.component.css']
})
export class DetalleEventoComponent {
  eventos: any[] = [];
  isConflict = false;
  esPresidente = false;
 

  constructor(
    public dialogRef: MatDialogRef<DetalleEventoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleEventoData,
    private eventService : EventService,
    private snackBar:MatSnackBar
  ) {
    this.isConflict = data.isConflict;
   if (data.userRol === 'Presidente' ){
    this.esPresidente = true;
   }  
     
    // Asegurarse de que siempre sea un array
    this.eventos = Array.isArray(data.eventos) ? data.eventos : [data.eventos];
  }

  cerrar() {
    this.dialogRef.close();
  }


    cancelarConflictos() {
    const eventosCancelados  = this.eventos; 
     this.cancelarEventosConflictivos(eventosCancelados);
    // Después cerrar el modal
    this.dialogRef.close({ aprobado: eventosCancelados, cancelados: this.eventos.slice(1) });
  }

  
  private cancelarEventosConflictivos(eventosCancelados: any[]): void {
    if (eventosCancelados.length === 0) {
      this.dialogRef.close({ aprobado: true, cancelados: [] });
      return;
    }

    let cancelacionesCompletadas = 0;

    eventosCancelados.forEach(evento => {
      this.eventService.updateEvent(evento.documentId, { status: 'cancelado' }).subscribe({
        next: (res: any) => {
          console.log('Evento cancelado:', res);
          cancelacionesCompletadas++;

          if (cancelacionesCompletadas === eventosCancelados.length) {
            this.snackBar.open('Eventos conflictivos cancelados', 'Cerrar', { duration: 3000 });
            this.dialogRef.close({ aprobado: true, cancelados: eventosCancelados });
          }
        },
        error: err => {
          console.error('Error al cancelar evento:', err);
          this.snackBar.open('Ocurrió un error al cancelar uno o más eventos', 'Cerrar', { duration: 3000 });
        }
      });
    });
  }
     

}
