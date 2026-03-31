import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// 🔥 Firebase Auth & Firestore
import { Auth, signOut, user } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

// 🔥 Componentes, Servicios y Extras
import { BitacoraComponent } from '../bitacora/bitacora.component';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2'; // Para alertas más bonitas

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BitacoraComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // --- Inyecciones de dependencia ---
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private api: ApiService = inject(ApiService);
  private router: Router = inject(Router);

  // --- Propiedades de Autenticación ---
  usuarioLogueado: any = null;

  // --- Variables de datos (MySQL Railway / Rest API) ---
  clientes: any[] = [];
  sucursales: any[] = [];
  servicios: any[] = [];
  cargando: boolean = false;
  
  // --- Firestore (Datos Documentales) ---
  bitacora$: any;

  // --- Modelo del formulario ---
  // Inicializamos con null para que el select muestre el placeholder
  nuevoServicio: any = {
    id_cliente: null,
    id_sucursal: null,
    trabajo_realizado: '',
    estado: 'pendiente' 
  };

  servicioSeleccionado: any = null;

  ngOnInit() {
    // 1. Escuchar el estado del usuario
    user(this.auth).subscribe((u) => {
      this.usuarioLogueado = u;
    });

    // 2. Cargar datos desde MySQL (API)
    this.cargarDatosIniciales();

    // 3. Cargar datos en tiempo real de Firestore (Bitácora)
    const ref = collection(this.firestore, 'bitacora');
    this.bitacora$ = collectionData(ref, { idField: 'id' });
  }

  // ==========================================
  // 🔹 MÉTODOS DE DATOS (API MYSQL)
  // ==========================================

  cargarDatosIniciales() {
    this.cargando = true;
    this.cargarClientes();
    this.cargarSucursales();
    this.cargarServicios();
  }

  cargarClientes() {
    this.api.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error("❌ Error Clientes:", err)
    });
  }

  cargarSucursales() {
    this.api.getSucursales().subscribe({
      next: (data: any) => this.sucursales = data,
      error: (err) => console.error("❌ Error Sucursales:", err)
    });
  }

  cargarServicios() {
    this.api.getServicios().subscribe({
      next: (data: any) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error("❌ ERROR API SERVICIOS:", err);
        this.cargando = false;
      }
    });
  }

  // ==========================================
  // 🔹 ACCIONES DEL FORMULARIO
  // ==========================================

  crearServicio() {
    // Validación de seguridad
    if (!this.nuevoServicio.id_cliente || !this.nuevoServicio.trabajo_realizado) {
      Swal.fire('Campos incompletos', 'Por favor selecciona un cliente y describe el trabajo.', 'warning');
      return;
    }

    // Aseguramos que los IDs sean números antes de enviar
    const datosParaEnviar = {
      ...this.nuevoServicio,
      id_cliente: Number(this.nuevoServicio.id_cliente),
      id_sucursal: this.nuevoServicio.id_sucursal ? Number(this.nuevoServicio.id_sucursal) : null
    };

    this.api.crearServicio(datosParaEnviar).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Registro de maquinaria creado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.cargarServicios(); // Refrescar la tabla automáticamente
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error("❌ Error al crear:", err);
        Swal.fire('Error', 'No se pudo guardar el servicio en la base de datos', 'error');
      }
    });
  }

  limpiarFormulario() {
    this.nuevoServicio = {
      id_cliente: null,
      id_sucursal: null,
      trabajo_realizado: '',
      estado: 'pendiente'
    };
  }

  // ==========================================
  // 🔹 MÉTODOS DE SESIÓN Y VISTA
  // ==========================================

  async salir() {
    const confirmacion = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que volver a ingresar tus credenciales",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await signOut(this.auth);
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  }

  verDetalles(servicio: any) {
    this.servicioSeleccionado = servicio;
  }
}