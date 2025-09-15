import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../Services/productos.service';
import { ProductoModel } from '../../interfases/producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.css'
})
export class ProductosListComponent {
  private service = inject(ProductosService);
  loading = signal(false);
  items = signal<ProductoModel[]>([]);
  filtro = signal('');

  filtered = computed(() => {
    const f = this.filtro().toLowerCase();
    return this.items().filter(p => p.nombre.toLowerCase().includes(f) || p.codigo.toLowerCase().includes(f));
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); Swal.fire('Error','No se pudieron cargar productos','error'); }
    });
  }

  eliminar(p: ProductoModel) {
    Swal.fire({ title: '¿Eliminar?', text: p.nombre, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar' })
      .then(res => {
        if (res.isConfirmed) {
          this.service.delete(p.id).subscribe({
            next: () => { Swal.fire('Ok','Producto dado de baja','success'); this.load(); },
            error: (e) => Swal.fire('Error', e.error?.message || 'No se eliminó', 'error')
          });
        }
      });
  }
}
