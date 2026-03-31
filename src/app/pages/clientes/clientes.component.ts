import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  private api = inject(ApiService);
  clientes: any[] = [];

  ngOnInit(): void {
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.api.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  async abrirModalNuevo() {
  // 1. Obtenemos las sucursales primero
  this.api.getSucursales().subscribe(async (sucursales) => {
    
    // 2. Creamos las opciones para el select del modal
    const sucursalesOptions = sucursales.map(s => 
      `<option value="${s.id_sucursal}">${s.nombre}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Cliente',
      html:
        `<input id="n-nombre" class="swal2-input" placeholder="Nombre">` +
        `<input id="n-empresa" class="swal2-input" placeholder="Empresa">` +
        `<input id="n-tel" class="swal2-input" placeholder="Teléfono">` +
        `<select id="n-sucursal" class="swal2-input">
          <option value="">Seleccionar Sucursal (Opcional)</option>
          ${sucursalesOptions}
        </select>`,
      preConfirm: () => {
        return {
          nombre: (document.getElementById('n-nombre') as HTMLInputElement).value,
          empresa: (document.getElementById('n-empresa') as HTMLInputElement).value,
          telefono: (document.getElementById('n-tel') as HTMLInputElement).value,
          id_sucursal: (document.getElementById('n-sucursal') as HTMLSelectElement).value
        }
      }
    });

    if (formValues) {
      this.api.crearCliente(formValues).subscribe(() => {
        Swal.fire('Guardado', 'Cliente registrado', 'success');
        this.obtenerClientes();
      });
    }
  });
}

  // ==========================================
  // 🔹 FUNCIÓN: EDITAR CLIENTE (Resuelve el error NG9)
  // ==========================================
  async editarCliente(cliente: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Datos del Cliente',
      html:
        `<input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${cliente.nombre}">` +
        `<input id="swal-empresa" class="swal2-input" placeholder="Empresa" value="${cliente.empresa}">` +
        `<input id="swal-tel" class="swal2-input" placeholder="Teléfono" value="${cliente.telefono}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      preConfirm: () => {
        return {
          nombre: (document.getElementById('swal-nombre') as HTMLInputElement).value,
          empresa: (document.getElementById('swal-empresa') as HTMLInputElement).value,
          telefono: (document.getElementById('swal-tel') as HTMLInputElement).value
        }
      }
    });

    if (formValues) {
      this.api.actualizarCliente(cliente.id_cliente, formValues).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'El cliente ha sido modificado.', 'success');
          this.obtenerClientes(); // Recarga la lista
        },
        error: (err) => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
    }
  }

  // ==========================================
  // 🔹 FUNCIÓN: VER HISTORIAL (Resuelve el error NG9)
  // ==========================================
 verHistorial(id_cliente: number) {
    // 1. Validar que el ID sea válido antes de disparar la petición
    if (!id_cliente) {
      console.error("❌ ID de cliente no válido:", id_cliente);
      Swal.fire('Error', 'No se pudo identificar al cliente', 'error');
      return;
    }

    console.log("🔍 Buscando servicios para el cliente ID:", id_cliente);

    this.api.getServicios().subscribe({
      next: (todosLosServicios) => {
        // Verificación de seguridad por si la API devuelve algo que no sea un arreglo
        if (!Array.isArray(todosLosServicios)) {
          console.error("❌ La respuesta no es un arreglo:", todosLosServicios);
          return;
        }

        // 2. Filtro robusto (compara por id_cliente, clienteId o id)
        const historial = todosLosServicios.filter(s => {
          const s_id = s.id_cliente || s.clienteId || s.id;
          return s_id != null && Number(s_id) === Number(id_cliente);
        });

        // 3. Caso: Sin registros
        if (historial.length === 0) {
          Swal.fire({
            title: 'Sin registros',
            text: 'Este cliente aún no tiene servicios realizados en la base de datos.',
            icon: 'info',
            confirmButtonColor: '#2563eb'
          });
          return;
        }

        // 4. Construcción del HTML para el modal
        let htmlLista = `
          <div style="max-height: 350px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; text-align: left;">
              <thead style="background: #f8f9fa; position: sticky; top: 0;">
                <tr>
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Fecha</th>
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Trabajo Realizado</th>
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">Estado</th>
                </tr>
              </thead>
              <tbody>`;

        historial.forEach(s => {
          // Validaciones para evitar errores de renderizado si faltan datos
          const fechaRaw = s.fecha ? new Date(s.fecha) : null;
          const fechaFormateada = fechaRaw && !isNaN(fechaRaw.getTime()) 
                                  ? fechaRaw.toLocaleDateString() 
                                  : 'S/F';
          
          const trabajo = s.trabajo_realizado || 'Sin descripción';
          const estado = (s.estado || 'pendiente').toLowerCase();
          
          // Color dinámico según el estado
          const colorEstado = estado === 'completado' ? '#059669' : '#d97706';

          htmlLista += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; color: #666;">${fechaFormateada}</td>
              <td style="padding: 10px; font-weight: 500;">${trabajo}</td>
              <td style="padding: 10px;">
                <span style="background: ${colorEstado}15; color: ${colorEstado}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${estado}
                </span>
              </td>
            </tr>`;
        });

        htmlLista += `</tbody></table></div>`;

        // 5. Lanzar el modal con SweetAlert2
        Swal.fire({
          title: '<span style="color: #1e293b">Historial de Cliente</span>',
          html: htmlLista,
          width: '700px',
          confirmButtonText: 'Cerrar ventana',
          confirmButtonColor: '#2563eb',
          showCloseButton: true
        });
      },
      error: (err) => {
        console.error("❌ Error de conexión:", err);
        Swal.fire('Error de Conexión', 'No se pudieron cargar los servicios desde Railway.', 'error');
      }
    });
  }
  // ==========================================
  // 🔹 FUNCIÓN: ELIMINAR CLIENTE
  // ==========================================
  eliminarCliente(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarCliente(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El cliente ha sido borrado.', 'success');
            this.obtenerClientes();
          },
          error: (err) => Swal.fire('Error', 'No se pudo eliminar el cliente', 'error')
        });
      }
    });
  }

  private async lanzarModalCliente() {
    // ... tu lógica de SweetAlert para Crear que ya funcionaba
  }
}