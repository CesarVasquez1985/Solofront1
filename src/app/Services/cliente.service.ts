import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ICliente } from '../interfases/icliente';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly rutaAPI = 'http://localhost:5026/api/Clientes';
  constructor(private http: HttpClient) {}

  todos(): Observable<ICliente[]> {
    var clientes = this.http
      .get<ICliente[]>(this.rutaAPI)
      .pipe(catchError(this.manejoErrores));
    return clientes;
  }
  manejoErrores(error: HttpErrorResponse) {
    const msg = error.error?.message || error.statusText || 'Error de red';
    return throwError(() => {
      new Error(msg);
    });
  }

  guardarCliente(cliente: ICliente): Observable<ICliente> {
    return this.http
      .post<ICliente>(this.rutaAPI, cliente)
      .pipe(catchError(this.manejoErrores));
  }
  actualizarCliente(cliente: ICliente): Observable<ICliente> {
    return this.http
      .put<ICliente>(`${this.rutaAPI}/${cliente.id}`, cliente)
      .pipe(catchError(this.manejoErrores));
  }
  uncliente(id: number): Observable<ICliente> {
    return this.http
      .get<ICliente>(`${this.rutaAPI}/${id}`)
      .pipe(catchError(this.manejoErrores));
  }
  eliminarcliente(id:number): Observable<number>{
    return this.http
      .delete<number>(`${this.rutaAPI}/${id}`)
      .pipe(catchError(this.manejoErrores));
  }
}
