import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { switchMap } from 'rxjs';
import { Consulta, Paciente } from './paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteClient {

  private readonly http = inject(HttpClient);
  private readonly baseUrl= 'http://localhost:3000/pacientes'; // token

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
      //plannutricional se añade  desde otra pantalla
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
  ){
    const consulta: Consulta = {
      fecha: dto.fecha ?? new Date().toISOString().slice(0,10),
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

  addPlanNutricional(
    pacienteId: string | number,
    dto: {
      desayuno: string,
      almuerzo: string,
      merienda: string,
      cena: string,
      snacks: string,
      notas: string
    }
  ) {
    return this.getPacienteById(pacienteId).pipe(
      switchMap((pacienteActual) => {
        const actualizado: Paciente = {
          ...pacienteActual,
          planNutricional: {
            desayuno: dto.desayuno,
            almuerzo: dto.almuerzo,
            merienda: dto.merienda,
            cena: dto.cena,
            snacks: dto.snacks,
            notas: dto.notas
          }
        };

        return this.http.put<Paciente>(`${this.baseUrl}/${pacienteId}`, actualizado);
      })
    );
  }

  updatePaciente(paciente: Paciente, id: string | number) {
    return this.http.put<Paciente>(`${this.baseUrl}/${id}`, paciente);
  }
  
  deletePaciente(id: string | number) {
    return this.http.delete<Paciente>(`${this.baseUrl}/${id}`);
  }
}
