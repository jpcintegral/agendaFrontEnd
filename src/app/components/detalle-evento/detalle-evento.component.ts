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
}
