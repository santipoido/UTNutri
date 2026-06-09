import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  nombre: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly NOMBRE_KEY = 'auth_nombre';
  private readonly USERNAME_KEY = 'auth_username';
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private http = inject(HttpClient);
  private router = inject(Router);

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.NOMBRE_KEY, response.nombre);
        localStorage.setItem(this.USERNAME_KEY, response.username);
      })
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.NOMBRE_KEY, response.nombre);
        localStorage.setItem(this.USERNAME_KEY, response.username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.NOMBRE_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getNombre(): string | null {
    return localStorage.getItem(this.NOMBRE_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  refreshPerfil(nombre: string, username: string): void {
    localStorage.setItem(this.NOMBRE_KEY, nombre);
    localStorage.setItem(this.USERNAME_KEY, username);
  }
}