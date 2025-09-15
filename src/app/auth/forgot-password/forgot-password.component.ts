import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  loading = signal(false);
  done = signal(false);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.recoverPassword({ email: this.form.value.email! }).subscribe({
      next: (ok) => {
        this.done.set(ok);
        this.loading.set(false);
        Swal.fire({ icon: 'success', title: 'Solicitud enviada', text: 'Revisa tu correo si existe en el sistema', timer: 2500 });
      },
      error: () => { this.loading.set(false); Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la solicitud' }); }
    });
  }
}
