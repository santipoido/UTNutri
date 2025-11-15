import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Consulta, Paciente, PlanNutricional, UpdatePacienteDto } from './paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteClient {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/pacientes'; // token
  private readonly planVacio: PlanNutricional = {
    desayuno: '',
    almuerzo: '',
    merienda: '',
    cena: '',
    snacks: '',
    notas: ''
  }

  getPacientes() {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  getPacienteById(id: string | number) {
    return this.http.get<Paciente>(`${this.baseUrl}/${id}`);
  }


  addPaciente(dto: {
    nombre: string,
    genero: string,
    fechaNacimiento: string,
    correo: string,
    telefono: string
  }) {
    const nuevoPaciente: Paciente = {
      nombre: dto.nombre,
      genero: dto.genero,
      fechaNacimiento: dto.fechaNacimiento,
      correo: dto.correo,
      telefono: dto.telefono,
      consultas: [],
      planNutricional: this.planVacio
    };

    return this.http.post<Paciente>(this.baseUrl, nuevoPaciente);
  }

  addConsulta(
    pacienteId: string,
    dto: {
      fecha: string;
      peso: number,
      altura: number,
      grasa?: number,
      masa?: number,
      observaciones?: string
    }
  ) {
    const consulta: Consulta = {
      fecha: dto.fecha ?? new Date().toISOString().slice(0, 10),
      peso: dto.peso,
      altura: dto.altura,
      grasa: dto.grasa,
      masa: dto.masa,
      observaciones: dto.observaciones
    };

    return this.getPacienteById(pacienteId).pipe(
      switchMap((pacienteActual) => {
        const actualizado: Paciente = {
          ...pacienteActual,
          consultas: [...(pacienteActual.consultas ?? []), consulta]
        };

        return this.http.put<Paciente>(`${this.baseUrl}/${pacienteId}`, actualizado);
      })
    );
  }

  updatePacientePlan(id: string | number, plan: PlanNutricional) {
    const propiedad = { planNutricional: plan };
    return this.http.patch<Paciente>(`${this.baseUrl}/${id}`, propiedad);
  }

  updatePaciente(dto: Partial<Paciente>, id: string | number) {
    return this.http.patch(`${this.baseUrl}/${id}`, dto);
  }

  deletePaciente(id: string | number) {
    return this.http.delete<Paciente>(`${this.baseUrl}/${id}`);
  }
}
