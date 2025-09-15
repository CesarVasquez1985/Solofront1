import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    pwd: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  ngOnInit() {
    // Si ya está autenticado y entra a / (login), redirigir a clientes
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/clientes']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.success.set(false);
    this.loading.set(true);
    const { email, pwd, remember } = this.form.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/clientes';
    this.auth.login({ email: email!, pwd: pwd! }, !!remember).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        Swal.fire({ icon: 'success', title: 'Bienvenido', text: 'Inicio de sesión exitoso', timer: 1500, showConfirmButton: false });
        this.router.navigate([returnUrl]);
      },
      error: (e) => {
        this.error.set(e.message || 'Credenciales inválidas');
        this.loading.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: this.error() || 'Error desconocido' });
      },
    });
  }
}
