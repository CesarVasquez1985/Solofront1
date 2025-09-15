import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../Services/productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductosService);

  loading = signal(false);
  editId: number | null = null;

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(3)]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    precioCompra: [0, [Validators.required, Validators.min(0)]],
    precioVenta: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    activo: [true]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.editId = +id; this.load(+id); }
  }

  load(id: number) {
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: p => { this.form.patchValue(p); this.loading.set(false); },
      error: () => { this.loading.set(false); Swal.fire('Error','No se pudo cargar el producto','error'); }
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.loading.set(true);
    if (!this.editId) {
      this.service.create(value as any).subscribe({
        next: p => { this.loading.set(false); Swal.fire('Creado','Producto creado','success'); this.router.navigate(['/productos']); },
        error: e => { this.loading.set(false); Swal.fire('Error', e.error?.message || 'Fallo al crear','error'); }
      });
    } else {
      this.service.update(this.editId, { id: this.editId, ...value } as any).subscribe({
        next: p => { this.loading.set(false); Swal.fire('Actualizado','Producto actualizado','success'); this.router.navigate(['/productos']); },
        error: e => { this.loading.set(false); Swal.fire('Error', e.error?.message || 'Fallo al actualizar','error'); }
      });
    }
  }
}
