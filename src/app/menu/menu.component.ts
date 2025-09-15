import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  private auth = inject(AuthService);
  // Convertimos el observable a signal reactivo; se actualiza automáticamente al hacer login/logout.
  user = toSignal(this.auth.currentUser$, { initialValue: null });

  isLogged() { return !!this.user(); }

  logout() {
    this.auth.logout();
  }
}
