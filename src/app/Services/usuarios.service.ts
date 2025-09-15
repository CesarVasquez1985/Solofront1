import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly rutaAPI = 'http://localhost:5026/api/Usuarios';
  constructor(private http: HttpClient) {}

  login(email: string, pwd: string) {
    return this.http.post(this.rutaAPI + '/login', { email, pwd });
  }
}
