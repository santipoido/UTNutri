import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClienteTurnos } from '../cliente-turnos';
import { Turno } from '../turno';

interface CeldaCalendario {
  fecha: Date;
  esMesActual: boolean;
  esHoy: boolean;
  turnos: Turno[];
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

@Component({
  selector: 'app-calendario-mensual',
  imports: [],
  templateUrl: './calendario-mensual.html',
  styleUrl: './calendario-mensual.css',
})
export class CalendarioMensual {
  private readonly router = inject(Router);
  private readonly client = inject(ClienteTurnos);

  protected readonly diasSemana = DIAS;

  protected readonly mesActual = signal(new Date());

  private readonly todosTurnos = toSignal(this.client.getTurnos(), { initialValue: [] });

  protected readonly tituloMes = computed(() => {
    const m = this.mesActual();
    return `${MESES[m.getMonth()]} ${m.getFullYear()}`;
  });

  // Set de fechas expandidas para el "+N más"
  protected readonly expandedDays = signal<Set<string>>(new Set());

  protected readonly celdasMes = computed((): CeldaCalendario[] => {
    const hoy = new Date();
    const mes = this.mesActual();
    const year = mes.getFullYear();
    const month = mes.getMonth();
    const turnos = this.todosTurnos();

    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    // Lunes = índice 0: (getDay() + 6) % 7
    const primerIndex = (primerDia.getDay() + 6) % 7;

    const celdas: CeldaCalendario[] = [];

    // Días de relleno del mes anterior
    for (let i = 0; i < primerIndex; i++) {
      const fecha = new Date(year, month, -(primerIndex - 1 - i));
      celdas.push({ fecha, esMesActual: false, esHoy: false, turnos: [] });
    }

    // Días del mes actual
    for (let day = 1; day <= ultimoDia.getDate(); day++) {
      const fecha = new Date(year, month, day);
      const esHoy = fecha.toDateString() === hoy.toDateString();
      celdas.push({ fecha, esMesActual: true, esHoy, turnos: [] });
    }

    // Relleno del mes siguiente
    const trailing = celdas.length % 7 === 0 ? 0 : 7 - (celdas.length % 7);
    for (let i = 1; i <= trailing; i++) {
      const fecha = new Date(year, month + 1, i);
      celdas.push({ fecha, esMesActual: false, esHoy: false, turnos: [] });
    }

    // Asignar turnos a cada celda
    celdas.forEach(celda => {
      celda.turnos = turnos.filter(t => {
        const ft = new Date(t.fecha);
        return (
          ft.getFullYear() === celda.fecha.getFullYear() &&
          ft.getMonth()    === celda.fecha.getMonth() &&
          ft.getDate()     === celda.fecha.getDate()
        );
      }).sort((a, b) => a.hora.localeCompare(b.hora));
    });

    return celdas;
  });

  mesPrevio(): void {
    const m = this.mesActual();
    this.mesActual.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
    this.expandedDays.set(new Set());
  }

  mesSiguiente(): void {
    const m = this.mesActual();
    this.mesActual.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
    this.expandedDays.set(new Set());
  }

  irAHoy(): void {
    this.mesActual.set(new Date());
    this.expandedDays.set(new Set());
  }

  toggleExpand(fecha: Date, event: Event): void {
    event.stopPropagation();
    const key = fecha.toDateString();
    this.expandedDays.update(set => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  isDayExpanded(fecha: Date): boolean {
    return this.expandedDays().has(fecha.toDateString());
  }

  irAFicha(idPaciente: number, event: Event): void {
    event.stopPropagation();
    this.router.navigateByUrl(`/pacientes/${idPaciente}/ficha`);
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':  return 'ev-pending';
      case 'Realizado':  return 'ev-done';
      case 'Cancelado':  return 'ev-cancelled';
      default:           return '';
    }
  }
}
