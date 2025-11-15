export type EstadoTurno = 'Pendiente' | 'Realizado' | 'Cancelado';

export interface Turno {
  id?: number | string;
  idPaciente: number | string;
  fecha: Date;       
  hora: string;      // "HH:mm"
  estado: EstadoTurno;
  observaciones: string;
}