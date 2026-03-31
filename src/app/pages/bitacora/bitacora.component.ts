import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit, OnChanges {

  @Input() servicioId!: number; // 👈 Este es el nombre "oficial"

  bitacora: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // 💡 Tip Pro: ngOnChanges detecta cuando cambias de un servicio a otro 
  // en la tabla sin cerrar el modal, refrescando los datos.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicioId'] && !changes['servicioId'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    if (this.servicioId) {
      this.api.getBitacora(this.servicioId).subscribe(data => {
        this.bitacora = data;
      });
    }
  }
}