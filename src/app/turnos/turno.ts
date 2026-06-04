export type EstadoTurno = 'Pendiente' | 'Realizado' | 'Cancelado';

// Modelo interno que usan los componentes (no cambia tu forma de trabajar)
export interface Turno {
  id?: number;
  idPaciente: number;
  fecha: Date;
  hora: string;        // "HH:mm"
  estado: EstadoTurno;
  observaciones: string;
  nombrePaciente?: string;
}

// Lo que realmente viaja desde/hacia el back
export interface TurnoBackDTO {
  id: number;
  pacienteId: number;
  nombrePaciente: string;
  fechaHora: string;   // LocalDateTime ISO: "2026-06-10T15:30:00"
  observaciones: string;
  estado: 'PENDIENTE' | 'REALIZADO' | 'CANCELADO';
  createdAt: string;
}