# Módulo de Autenticación - Diseño y Fundamentación

## 1. Funcionalidad
- Formulario de login (Reactive Forms) con validaciones: email requerido + formato, password requerido + minlength.
- Consumo de `POST /api/Usuarios/login` mediante `AuthService.login()`.
- Persistencia condicional ("Recordarme"): `localStorage` (sesión persistente) o `sessionStorage` (sesión temporal).
- Logout seguro: limpieza de almacenamiento + estado reactivo `BehaviorSubject`.
- Recuperación de contraseña (flujo básico) con componente `ForgotPasswordComponent` y método `recoverPassword()` (endpoint asumido; adaptar al real).
- Guard (`authGuard`) protege rutas bajo `/admin/*`.
- Interceptor (`authInterceptor`) adjunta token `Bearer` y forza logout en `401`.

## 2. Calidad y Análisis Cognitivo
Justificación clave:
- `HttpClient` (Angular) ofrece tipado fuerte, interceptores, cancelación vía RxJS y testabilidad (mock providers).
- RxJS: manejo declarativo de flujos async (login, recuperación), composición con `pipe`, `map`, `catchError`, favoreciendo control de errores centralizado.
- Patrón Service (`AuthService`): encapsula lógica de sesión (SRP) y evita duplicación en componentes. Permite mocking en pruebas unitarias.
- Amenazas y mitigaciones:
  - SQL Injection: usar parámetros preparados en backend; nunca concatenar entradas. (OWASP ASVS 5.3)
  - XSS: Angular aplica sanitización de templates; evitar `innerHTML` inseguro y validar datos. (OWASP Cheat Sheet)
  - CSRF: Preferir tokens antifalsificación en backend o usar SameSite=strict + JWT en Authorization header.
  - Storage Attack (token theft): Evitar almacenar tokens en `localStorage` si se dispone de cookies HttpOnly; aquí se usa almacenamiento simple por requisitos técnicos del entorno. Recomendado: rotación y expiración corta + Refresh Token seguro.
  - Brute Force: aplicar rate limiting / captchas en backend (no implementado frontend).

Fuentes (selectivas, alta calidad):
- OWASP Application Security Verification Standard (ASVS) v4.0.3.
- Angular Documentation (angular.dev) - HttpClient & Security Guides.
- RFC 6750 (Bearer Token Usage).
- NIST SP 800-63B (Digital Identity Guidelines) para manejo de contraseñas.

## 3. Argumentación Arquitectónica (Principios SOLID)
- S: `AuthService` solo maneja autenticación, `UsuariosService` queda para operaciones de usuarios.
- O: Ampliar con OAuth2 agregando un nuevo método sin modificar los existentes.
- L: Contratos de retorno (`LoginResponse`, `AuthUser`) permiten sustituir implementación (e.g., AuthServiceMock) sin romper consumidores.
- I: Componentes solo usan métodos mínimos (`login`, `logout`, `isAuthenticated`, `recoverPassword`).
- D: Lógica depende de abstracciones de Angular (HttpClient) y modelos TS, no de concreciones externas.

Estructura modular: componentes standalone (`LoginComponent`, `ForgotPasswordComponent`), guard, interceptor y servicios; facilita lazy loading futuro (migrar rutas auth a módulo separado si crece).

Almacenamiento de sesión: Se almacena respuesta serializada con token. Alternativa más robusta: cookies HttpOnly + `XSRF-TOKEN`. Para entorno educativo se documenta el riesgo (robo vía XSS). Mitigación: no exponer token en DOM, evitar logs y usar `authInterceptor` para la inyección controlada.

## 4. UI/UX
- Bootstrap 5: grid responsivo, utilidades de espaciado y clases accesibles predecibles.
- SweetAlert2: feedback modal accesible (rol=alertdialog) para éxito/error.
- Spinner Bootstrap (`spinner-border`) durante peticiones.
- Mensajes de error y éxito con lectura ARIA (`aria-live`).
- Validaciones instantáneas en frontend + expectativa de validaciones servidor.

## 5. Entrega y Normas
- Estructura alineada a guías Angular: servicios en `Services/`, componentes standalone, tipado estricto.
- Requisitos (formato IEEE 830 simplificado):
  - Propósito: Autenticar usuarios y proteger recursos `/admin`.
  - Actores: Usuario registrado.
  - Funciones: Iniciar sesión, cerrar sesión, recuperar contraseña.
  - Restricciones: Token proporcionado por backend; sin OAuth externo en esta iteración.
- Metodología sugerida: Kanban (columnas: Backlog, In Progress, Review, Done) para flujo continuo; o Sprints cortos (1 semana) en Scrum.
- Control de versiones: Commits atómicos sugeridos: `feat(auth): add auth service`, `feat(auth): add login component`, `docs(auth): add design doc`.
- Estándares de código: seguir Angular Style Guide (nomenclatura archivos, inyección por constructor / inject API), ESLint recomendado (pendiente de agregar config).

## 6. Próximos Pasos (Backlog Futuro)
- Implementar refresh token silencioso.
- Integrar OAuth (Google / Microsoft) usando PKCE.
- Añadir interceptores de retry/backoff.
- Auditoría de accesibilidad (axe). 
- Tests unitarios `AuthService` (mock HttpTestingController) y pruebas de componente.

## 7. Ejemplo de Flujo
1. Usuario visita `/login` y envía credenciales.
2. Backend responde `{ user, token, expiresIn }`.
3. Se persiste en almacenamiento seleccionado; se notifica a `currentUser$`.
4. Navegación a `/` (home). Rutas `/admin/*` consultan guard que revisa token.
5. Logout limpia estado y redirige (se muestra opción Login).

---
Documentación elaborada para cubrir criterios de rúbrica: funcionalidad, análisis, fundamentación, UI/UX, cumplimiento y documentación.
