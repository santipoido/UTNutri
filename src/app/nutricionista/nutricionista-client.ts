import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface NutricionistaDTO {
  id: number;
  username: string;
  email: string;
  nombre: string;
  createdAt: string;
}

export interface NutricionistaUpdateRequest {
  username: string;
  email: string;
  nombre: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class NutricionistaClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/nutricionistas`;

  getPerfil() {
    return this.http.get<NutricionistaDTO>(`${this.baseUrl}/perfil`);
  }

  updatePerfil(request: NutricionistaUpdateRequest) {
    return this.http.put<NutricionistaDTO>(`${this.baseUrl}/perfil`, request);
  }
}
