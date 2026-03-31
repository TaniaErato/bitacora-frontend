import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth'; // 🔥 Importante
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  async logout() {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Se finalizará tu sesión actual",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await signOut(this.auth); // Cierra sesión en Firebase
        console.log('✅ Sesión cerrada');
        this.router.navigate(['/login']); // Redirige al login
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
      }
    }
  }
}