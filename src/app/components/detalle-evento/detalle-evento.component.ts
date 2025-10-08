import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';


export interface DetalleEventoData {
  eventos: any | any[];
  isConflict: boolean;
}



export interface DetalleEventoData {
  eventos: any | any[];
  isConflict: boolean;
}

@Component({
  selector: 'app-detalle-evento',
  standalone: true,
  imports: [MatDialogModule,CommonModule, MatButtonModule, MatCardModule, MatDividerModule],
  templateUrl: './detalle-evento.component.html',
  styleUrls: ['./detalle-evento.component.css']
})
export class DetalleEventoComponent {
  eventos: any[] = [];
  isConflict = false;
    esPresidente = false;

  constructor(
    public dialogRef: MatDialogRef<DetalleEventoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleEventoData
  ) {
    this.isConflict = data.isConflict;
    // Asegurarse de que siempre sea un array
    this.eventos = Array.isArray(data.eventos) ? data.eventos : [data.eventos];
  }

  cerrar() {
    this.dialogRef.close();
  }


    aprobarEventoYCancelarConflictos() {
    const eventoSeleccionado = this.eventos[0]; // asumimos que es el primero o el que el usuario seleccionó
    // Lógica real: llamar al backend para actualizar estados
    console.log('Evento aprobado:', eventoSeleccionado);
    console.log('Se cancelan los demás eventos en conflicto:', this.eventos.slice(1));

    // Después cerrar el modal
    this.dialogRef.close({ aprobado: eventoSeleccionado, cancelados: this.eventos.slice(1) });
  }

  obtenerUsuarioActual() {
    // Simulación: reemplazar con servicio real de autenticación
    return { nombre: 'Juan Pérez', rol: 'PRESIDENTE' };
  }
}
