import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth, user, signOut } from '@angular/fire/auth'; // 👈 Añade signOut
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);
  mostrarMenu = false;

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.mostrarMenu = !event.urlAfterRedirects.includes('/login');
    });

    user(this.auth).subscribe(u => {
      this.mostrarMenu = !!u && !this.router.url.includes('/login');
    });
  }

  // 🔥 ESTA ES LA FUNCIÓN QUE FALTA
  async salir() {
    const confirm = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Se cerrará el acceso al sistema",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await signOut(this.auth); // Cierra sesión en Firebase
        this.mostrarMenu = false; // Oculta el menú
        this.router.navigate(['/login']); // Redirige al login
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  }
}