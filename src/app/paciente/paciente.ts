export interface Paciente {
    id?: string | number,
    nombre: string,
    genero: string,
    fechaNacimiento: string,
    correo: string,
    telefono: string,
    consultas: Consulta[],
    planNutricional?: PlanNutricional
}

export interface Consulta {
    fecha: string,
    peso: number,
    altura: number,
    grasa?: number,
    masa?: number,
    observaciones?: string
}

export interface PlanNutricional {
    desayuno: string,
    almuerzo: string,
    merienda: string,
    cena: string,
    snacks: string
}