import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoModel, ProductoCreate, ProductoUpdate } from '../interfases/producto.model';
import { InventarioReporte } from '../interfases/inventario-reporte.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5026/api/Productos';

  list(): Observable<ProductoModel[]> { return this.http.get<ProductoModel[]>(this.baseUrl); }
  get(id: number): Observable<ProductoModel> { return this.http.get<ProductoModel>(`${this.baseUrl}/${id}`); }
  create(prod: ProductoCreate): Observable<ProductoModel> { return this.http.post<ProductoModel>(this.baseUrl, prod); }
  update(id: number, prod: ProductoUpdate): Observable<ProductoModel> { return this.http.put<ProductoModel>(`${this.baseUrl}/${id}`, prod); }
  ajustarStock(id: number, cantidad: number): Observable<number> {
    const params = new HttpParams().set('cantidad', cantidad);
    return this.http.patch<number>(`${this.baseUrl}/${id}/stock`, null, { params });
  }
  delete(id: number): Observable<number> { return this.http.delete<number>(`${this.baseUrl}/${id}`); }

  reporteInventario(umbralStockBajo: number): Observable<InventarioReporte> {
    const params = new HttpParams().set('umbralStockBajo', umbralStockBajo);
    return this.http.get<InventarioReporte>(`${this.baseUrl}/reporte-inventario`, { params });
  }
}
