import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EstadoTurno, Turno, TurnoBackDTO } from './turno';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteTurnos {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/turnos`;

  // ─── Mapeo back → front ────────────────────────────────────────────────────
  private aTurno(dto: TurnoBackDTO): Turno {
    const fecha = new Date(dto.fechaHora);
    const hora = dto.fechaHora.split('T')[1]?.slice(0, 5) ?? '';
    return {
      id: dto.id,
      idPaciente: dto.pacienteId,
      fecha,
      hora,
      estado: this.aEstadoFront(dto.estado),
      observaciones: dto.observaciones,
      nombrePaciente: dto.nombrePaciente
    };
  }

  private aEstadoFront(estado: TurnoBackDTO['estado']): EstadoTurno {
    switch (estado) {
      case 'REALIZADO': return 'Realizado';
      case 'CANCELADO': return 'Cancelado';
      default: return 'Pendiente';
    }
  }

  private aEstadoBack(estado: EstadoTurno): TurnoBackDTO['estado'] {
    return estado.toUpperCase() as TurnoBackDTO['estado'];
  }

  // Combina fecha (Date) + hora ("HH:mm") → "YYYY-MM-DDTHH:mm:00"
  private aFechaHora(fecha: Date, hora: string): string {
    const f = new Date(fecha);
    const yyyy = f.getFullYear();
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const dd = String(f.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hora}:00`;
  }

  // ─── Obtener ──────────────────────────────────────────────────────────────

  getTurnos() {
    return this.http.get<TurnoBackDTO[]>(this.baseUrl).pipe(
      map(dtos => dtos.map(d => this.aTurno(d)))
    );
  }

  getProximosTurnos() {
    return this.http.get<TurnoBackDTO[]>(`${this.baseUrl}/proximos`).pipe(
      map(dtos => dtos.map(d => this.aTurno(d)))
    );
  }

  getTurnoById(id: number) {
    return this.http.get<TurnoBackDTO>(`${this.baseUrl}/${id}`).pipe(
      map(d => this.aTurno(d))
    );
  }

  getTurnosPorPaciente(pacienteId: number) {
    return this.http.get<TurnoBackDTO[]>(`${this.baseUrl}/paciente/${pacienteId}`).pipe(
      map(dtos => dtos.map(d => this.aTurno(d)))
    );
  }

  // ─── Crear ────────────────────────────────────────────────────────────────

  addTurno(turno: Omit<Turno, 'id'>) {
    const body = {
      pacienteId: turno.idPaciente,
      fechaHora: this.aFechaHora(turno.fecha, turno.hora),
      observaciones: turno.observaciones
    };
    return this.http.post<TurnoBackDTO>(this.baseUrl, body).pipe(
      map(d => this.aTurno(d))
    );
  }

  // ─── Actualizar ───────────────────────────────────────────────────────────

  updateTurno(id: number, turno: Partial<Omit<Turno, 'id'>>) {
    const body: any = {};
    if (turno.fecha && turno.hora) {
      body.fechaHora = this.aFechaHora(turno.fecha, turno.hora);
    }
    if (turno.observaciones !== undefined) body.observaciones = turno.observaciones;
    if (turno.estado !== undefined) body.estado = this.aEstadoBack(turno.estado);

    return this.http.patch<TurnoBackDTO>(`${this.baseUrl}/${id}`, body).pipe(
      map(d => this.aTurno(d))
    );
  }

  cancelarTurno(id: number) {
    return this.http.patch<TurnoBackDTO>(`${this.baseUrl}/${id}`, { estado: 'CANCELADO' }).pipe(
      map(d => this.aTurno(d))
    );
  }

  // ─── Eliminar ─────────────────────────────────────────────────────────────

  deleteTurno(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}