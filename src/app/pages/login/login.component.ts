import { Component, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  async loginConGoogle() {
    console.log("🚀 Intentando iniciar sesión con Google...");
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        console.log('✅ Usuario autenticado:', result.user.displayName);
        
        // Alerta de bienvenida
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola, ${result.user.displayName}`,
          timer: 1500,
          showConfirmButton: false
        });

        // Redirección al Dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('❌ Error al autenticar con Google:', error);
      
      // Si el error es que cerraste la ventanita de Google antes de terminar
      if (error.code === 'auth/popup-closed-by-user') {
        Swal.fire('Atención', 'Cerraste la ventana de inicio de sesión', 'info');
      } else {
        Swal.fire('Error', 'Hubo un problema al conectar con Google', 'error');
      }
    }
  }
}