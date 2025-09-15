import { Component, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../Services/productos.service';
import { InventarioReporte } from '../../interfases/inventario-reporte.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

Chart.register(...registerables);

@Component({
  selector: 'app-reporte-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './reporte-inventario.component.html',
  styleUrl: './reporte-inventario.component.css'
})
export class ReporteInventarioComponent {
  private service = inject(ProductosService);

  // Estado
  loading = signal(false);
  error = signal<string | null>(null);
  umbral = signal<number>(100);
  data = signal<InventarioReporte | null>(null);

  // Gráfico
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  // Derivados
  productosStockBajo = computed(() => this.data()?.productosStockBajo || []);

  // Se invoca sólo cuando el usuario pulsa Buscar
  buscar() {
    this.loading.set(true);
    this.error.set(null);
    this.service.reporteInventario(this.umbral()).subscribe({
      next: rep => { this.data.set(rep); this.loading.set(false); this.renderChart(); },
      error: e => { this.error.set(e.error?.message || e.message || 'Error'); this.loading.set(false); }
    });
  }

  private renderChart() {
    const ctx = this.chartCanvas?.nativeElement?.getContext('2d');
    if (!ctx || !this.data()) return;
    if (this.chart) { this.chart.destroy(); }
    const labels = this.productosStockBajo().map(p => p.codigo);
    const stocks = this.productosStockBajo().map(p => p.stock);
    const umbrales = this.productosStockBajo().map(p => p.umbral);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Stock', data: stocks, backgroundColor: 'rgba(54,162,235,0.6)' },
          { label: 'Umbral', data: umbrales, backgroundColor: 'rgba(255,99,132,0.5)' }
        ]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    };
    this.chart = new Chart(ctx, config);
  }

  exportarExcel() {
    if (!this.data()) return;
    // Hoja resumen
    const resumen = [{
      TotalProductosActivos: this.data()!.totalProductosActivos,
      TotalItemsEnStock: this.data()!.totalItemsEnStock,
      ValorTotalCosto: this.data()!.valorTotalCosto,
      ValorTotalVenta: this.data()!.valorTotalVenta,
      MargenPotencial: this.data()!.margenPotencial,
      UmbralStockBajo: this.data()!.umbralStockBajo,
      GeneradoEnUtc: this.data()!.generadoEnUtc
    }];

    const wb = XLSX.utils.book_new();
    const wsResumen = XLSX.utils.json_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const wsDetalle = XLSX.utils.json_to_sheet(this.productosStockBajo().map(p => ({
      ID: p.id,
      Codigo: p.codigo,
      Nombre: p.nombre,
      Stock: p.stock,
      Umbral: p.umbral,
      ValorInventario: p.valorInventario,
      PrecioCompra: p.precioCompra
    })));
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'StockBajo');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `reporte_inventario_${new Date().toISOString()}.xlsx`);
  }

  imprimir() {
    const contenido = document.getElementById('reporte-inventario-root');
    if (!contenido) return;
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) return;
    ventana.document.write(`<html><head><title>Reporte Inventario</title><style>${this.stylesImpresion()}</style></head><body>${contenido.innerHTML}</body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  }

  private stylesImpresion(): string {
    return `body{font-family: Arial; margin:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ccc; padding:4px; font-size:12px;} th{background:#f5f5f5;} h2{margin-top:0;}`;
  }
}
