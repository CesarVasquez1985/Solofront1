import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthUser, LoginRequest, LoginResponse, PasswordRecoveryRequest } from '../interfases/auth.models';

// Principios aplicados:
// S (SRP): Servicio dedicado solo a autenticación / sesión.
// O (OCP): Métodos preparados para extender (e.g., agregar OAuth) sin modificar existentes.
// L (LSP): Contratos claros mediante interfaces para poder sustituir implementaciones en pruebas.
// I (ISP): Se exponen solo métodos necesarios para componentes (login, logout, isAuthenticated, recoverPassword).
// D (DIP): Depende de abstracciones (interfaces de modelos) y HttpClient provisto por Angular.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5026/api/Usuarios';
  private readonly storageKey = 'auth_session_v1';

  // BehaviorSubject mantiene el último valor para nuevos suscriptores.
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readStoredSession()?.user ?? null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readStoredSession(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }

  private persistSession(data: LoginResponse, remember: boolean) {
    const serialized = JSON.stringify(data);
    if (remember) {
      localStorage.setItem(this.storageKey, serialized);
      sessionStorage.removeItem(this.storageKey);
    } else {
      sessionStorage.setItem(this.storageKey, serialized);
      localStorage.removeItem(this.storageKey);
    }
  }

  login(payload: LoginRequest, remember = true): Observable<AuthUser> {
    const body = { email: payload.email, pwd: payload.pwd };
    return this.http.post<any>(`${this.baseUrl}/login`, body).pipe(
      map(raw => {
        // El backend podría devolver diferentes formas. Normalizamos.
        const user: AuthUser | undefined = raw?.user || raw?.usuario || raw?.data || raw;
        const token: string | undefined = raw?.token || raw?.jwt || raw?.accessToken;
        if (!user) throw new Error('Respuesta sin usuario');
        const normalized: LoginResponse = {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            roles: user.roles
          },
          token: token || 'no-token', // Permitimos ausencia de token si aún no implementado
          expiresIn: raw?.expiresIn,
          refreshToken: raw?.refreshToken
        };
        this.persistSession(normalized, remember);
        this.currentUserSubject.next(normalized.user);
        return normalized.user;
      }),
      catchError(err => {
        const message = err?.error?.message || err.message || 'Error al autenticar';
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.readStoredSession()?.token;
  }

  getToken(): string | null {
    return this.readStoredSession()?.token ?? null;
  }

  recoverPassword(req: PasswordRecoveryRequest): Observable<boolean> {
    // Endpoint hipotético: POST /password/recover
    return this.http.post(`${this.baseUrl}/password/recover`, req).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
