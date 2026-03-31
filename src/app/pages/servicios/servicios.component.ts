import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { BitacoraComponent } from '../bitacora/bitacora.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, BitacoraComponent],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {

  servicios: any[] = [];
  servicioSeleccionado: any = null;
  mostrarModal: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios() {
    this.api.getServicios().subscribe({
      next: (data: any) => {
        this.servicios = data;
      },
      error: (err) => console.error("Error al cargar servicios:", err)
    });
  }

  verDetalles(servicio: any) {
    this.servicioSeleccionado = servicio;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.servicioSeleccionado = null;
  }
}