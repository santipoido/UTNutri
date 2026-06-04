import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Consulta, Paciente, PacienteCreateRequest, PacienteUpdateRequest, PlanNutricional } from './paciente';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacienteClient {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pacientes`;

  // ─── Pacientes ───────────────────────────────────────────────────────────

  getPacientes() {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  getPacienteById(id: number) {
    return this.http.get<Paciente>(`${this.baseUrl}/${id}`);
  }

  addPaciente(dto: PacienteCreateRequest) {
    return this.http.post<Paciente>(this.baseUrl, dto);
  }

  updatePaciente(id: number, dto: PacienteUpdateRequest) {
    return this.http.put<Paciente>(`${this.baseUrl}/${id}`, dto);
  }

  deletePaciente(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ─── Consultas ───────────────────────────────────────────────────────────

  getConsultas(pacienteId: number) {
    return this.http.get<Consulta[]>(`${this.baseUrl}/${pacienteId}/consultas`);
  }

  addConsulta(pacienteId: number, dto: Omit<Consulta, 'id'>) {
    return this.http.post<Consulta>(`${this.baseUrl}/${pacienteId}/consultas`, dto);
  }

  updateConsulta(pacienteId: number, consultaId: number, dto: Omit<Consulta, 'id'>) {
    return this.http.put<Consulta>(`${this.baseUrl}/${pacienteId}/consultas/${consultaId}`, dto);
  }

  deleteConsulta(pacienteId: number, consultaId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${pacienteId}/consultas/${consultaId}`);
  }

  // ─── Plan Nutricional ─────────────────────────────────────────────────────

  getPlan(pacienteId: number) {
    return this.http.get<PlanNutricional>(`${this.baseUrl}/${pacienteId}/plan`);
  }

  upsertPlan(pacienteId: number, dto: Omit<PlanNutricional, 'id'>) {
    return this.http.put<PlanNutricional>(`${this.baseUrl}/${pacienteId}/plan`, dto);
  }

  deletePlan(pacienteId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${pacienteId}/plan`);
  }
}