// Modelos relacionados a autenticación y sesión
// Principio SRP: cada interfaz representa un contrato específico.
export interface LoginRequest {
  email: string;
  pwd: string; // El backend espera 'pwd'
}

export interface AuthUser {
  id: number;
  email: string;
  nombre?: string;
  roles?: string[];
}

export interface LoginResponse {
  user: AuthUser;
  token: string; // JWT o similar entregado por el backend
  expiresIn?: number; // segundos
  refreshToken?: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}
