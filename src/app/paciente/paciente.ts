export interface Paciente {
  id?: number;
  nombre: string;
  genero: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
}

export interface PacienteCreateRequest {
  nombre: string;
  genero: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
}

export interface PacienteUpdateRequest {
  nombre: string;
  genero: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
}

export interface Consulta {
  id?: number;
  fecha: string;
  peso: number;
  altura: number;
  grasa?: number;
  masa?: number;
  observaciones?: string;
}

export interface PlanNutricional {
  id?: number;
  desayuno: string;
  almuerzo: string;
  merienda: string;
  cena: string;
  snacks: string;
  notas: string;
}