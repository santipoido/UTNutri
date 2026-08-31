import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';
import { PacienteClient } from '../paciente-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Consulta, Paciente } from '../paciente';
import { ClienteTurnos } from '../../turnos/cliente-turnos';
import { Turno } from '../../turnos/turno';
import { DatePipe } from '@angular/common';
import { AppModalComponent } from '../../components/modal/modal';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-ficha-paciente',
  imports: [DatePipe, AppModalComponent],
  templateUrl: './ficha-paciente.html',
  styleUrl: './ficha-paciente.css'
})
export class FichaPaciente implements AfterViewInit, OnDestroy {
  protected readonly client = inject(PacienteClient);
  private readonly clienteTurnos = inject(ClienteTurnos);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  paciente = signal<Paciente | null>(null);
  consultas = signal<Consulta[]>([]);
  proximosTurnos = signal<Turno[]>([]);

  // ── ViewChild para los canvas de los gráficos ────────────────────────────
  @ViewChild('pesoCanvas')      private pesoCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('grasaCanvas')     private grasaCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('masaCanvas')      private masaCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('combinadoCanvas') private combinadoCanvasRef?: ElementRef<HTMLCanvasElement>;

  private viewReady = signal(false);
  private chartInstances: Chart[] = [];

  // ── Modal state ──────────────────────────────────────────────────────────
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmLabel = 'Aceptar';
  modalType: 'info' | 'confirm' | 'danger' = 'info';
  private pendingAction: (() => void) | null = null;

  openInfoModal(title: string, message: string, onAccept?: () => void): void {
    this.modalTitle        = title;
    this.modalMessage      = message;
    this.modalConfirmLabel = 'Aceptar';
    this.modalType         = 'info';
    this.pendingAction     = onAccept ?? null;
    this.modalVisible      = true;
  }

  onModalConfirmado(): void {
    const action = this.pendingAction;
    this.pendingAction = null;
    this.modalVisible  = false;
    action?.();
  }

  onModalCancelado(): void {
    this.pendingAction = null;
    this.modalVisible  = false;
  }

  private openConfirmModal(title: string, message: string, confirmLabel: string, action: () => void): void {
    this.modalTitle        = title;
    this.modalMessage      = message;
    this.modalConfirmLabel = confirmLabel;
    this.modalType         = 'confirm';
    this.pendingAction     = action;
    this.modalVisible      = true;
  }
  // ─────────────────────────────────────────────────────────────────────────

  errorMsgTurnos = '';

  esVencido(turno: Turno): boolean {
    return turno.estado === 'Pendiente' && new Date(turno.fecha).getTime() < Date.now();
  }

  reprogramarTurno(turno: Turno): void {
    this.router.navigateByUrl(`/turnos/${turno.idPaciente}/editar/${turno.id}`);
  }

  cancelarTurno(id: number): void {
    this.openConfirmModal(
      'Cancelar turno',
      '¿Estás seguro que querés cancelar este turno?',
      'Sí, cancelar',
      () => this.clienteTurnos.cancelarTurno(id).subscribe({
        next: () => location.reload(),
        error: () => { this.errorMsgTurnos = 'No pudimos cancelar el turno. Intentá nuevamente.'; }
      })
    );
  }

  aceptarTurno(id: number): void {
    this.openConfirmModal(
      'Marcar como realizado',
      '¿Confirmás que esta consulta ya se realizó?',
      'Sí, marcar como realizado',
      () => this.clienteTurnos.aceptarTurno(id).subscribe({
        next: () => location.reload(),
        error: () => { this.errorMsgTurnos = 'No pudimos actualizar el turno. Intentá nuevamente.'; }
      })
    );
  }

  ultimaConsulta = computed<Consulta | null>(() => {
    const ordenadas = [...this.consultas()].sort((a, b) => {
      const diffFecha = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      return diffFecha !== 0 ? diffFecha : (b.id ?? 0) - (a.id ?? 0);
    });
    return ordenadas[0] ?? null;
  });

  ultimoPesoKg = computed<number | null>(() => this.ultimaConsulta()?.peso ?? null);
  ultimaFecha  = computed<string | null>(() => this.ultimaConsulta()?.fecha ?? null);

  pacienteDesde = computed<string | null>(() => {
    if (!this.consultas().length) return null;
    const ordenadasAsc = [...this.consultas()].sort((a, b) => {
      const diffFecha = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      return diffFecha !== 0 ? diffFecha : (a.id ?? 0) - (b.id ?? 0);
    });
    return ordenadasAsc[0]?.fecha ?? null;
  });

  protected readonly hayDatosGraficos = computed(() => this.consultas().length >= 2);

  constructor() {
    // Reconstruye los gráficos cada vez que cambian las consultas o la vista está lista
    effect(() => {
      const data = this.consultas();
      if (!this.viewReady()) return;
      this.destroyCharts();
      if (data.length >= 2) {
        // Promise.resolve garantiza que Angular ya actualizó los @ViewChild
        Promise.resolve().then(() => this.buildCharts(data));
      }
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')!);

    this.client.getPacienteById(id).subscribe({
      next: p => this.paciente.set(p),
      error: () => this.openInfoModal('Paciente no encontrado', 'No se pudo cargar el paciente.', () => {
        this.router.navigateByUrl('/pacientes');
      })
    });

    this.client.getConsultas(id).subscribe({
      next: c => this.consultas.set(c),
      error: () => this.consultas.set([])
    });

    this.clienteTurnos.getTurnosPorPaciente(id).subscribe({
      next: turnos => {
        const proximos = turnos
          .filter(t => t.estado === 'Pendiente')
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        this.proximosTurnos.set(proximos);
      },
      error: () => this.proximosTurnos.set([])
    });
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    this.chartInstances.forEach(c => c.destroy());
    this.chartInstances = [];
  }

  private buildCharts(consultas: Consulta[]): void {
    const sorted = [...consultas].sort((a, b) => {
      const diffFecha = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      return diffFecha !== 0 ? diffFecha : (a.id ?? 0) - (b.id ?? 0);
    });

    const labels = sorted.map(c => c.fecha.slice(0, 10));
    const pesos  = sorted.map(c => c.peso);
    const grasas = sorted.map(c => c.grasa ?? null);
    const masas  = sorted.map(c => c.masa ?? null);

    const lineStyle = (color: string, fill = false) => ({
      borderColor: color,
      backgroundColor: fill ? color.replace(')', ', 0.12)').replace('rgb', 'rgba') : 'transparent',
      borderWidth: 2,
      tension: 0.3,
      fill,
      pointBackgroundColor: color,
      pointRadius: 4,
      pointHoverRadius: 6,
    });

    const axisStyle = {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { font: { family: 'Inter', size: 11 } }
    };

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { bodyFont: { family: 'Inter' }, titleFont: { family: 'Inter' } }
      },
      scales: { x: axisStyle, y: axisStyle }
    };

    if (this.pesoCanvasRef) {
      this.chartInstances.push(new Chart(this.pesoCanvasRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: 'Peso (kg)', data: pesos, ...lineStyle('#3D8A60', true) }]
        },
        options: { ...baseOptions }
      }));
    }

    if (this.grasaCanvasRef) {
      this.chartInstances.push(new Chart(this.grasaCanvasRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: '% Grasa', data: grasas as number[], ...lineStyle('#ef4444', true) }]
        },
        options: { ...baseOptions }
      }));
    }

    if (this.masaCanvasRef) {
      this.chartInstances.push(new Chart(this.masaCanvasRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: '% Músculo', data: masas as number[], ...lineStyle('#3b82f6', true) }]
        },
        options: { ...baseOptions }
      }));
    }

    if (this.combinadoCanvasRef) {
      this.chartInstances.push(new Chart(this.combinadoCanvasRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Peso (kg)', data: pesos,              ...lineStyle('#3D8A60'), yAxisID: 'yKg'  },
            { label: '% Grasa',   data: grasas as number[], ...lineStyle('#ef4444'), yAxisID: 'yPct' },
            { label: '% Músculo', data: masas  as number[], ...lineStyle('#3b82f6'), yAxisID: 'yPct' },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 12 }
            },
            tooltip: { bodyFont: { family: 'Inter' }, titleFont: { family: 'Inter' } }
          },
          scales: {
            x: axisStyle,
            yKg: {
              ...axisStyle,
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'kg', font: { family: 'Inter', size: 11 } }
            },
            yPct: {
              ...axisStyle,
              type: 'linear',
              position: 'right',
              title: { display: true, text: '%', font: { family: 'Inter', size: 11 } },
              grid: { drawOnChartArea: false }
            }
          }
        }
      }));
    }
  }

  irAgregarConsulta(id: number) { this.router.navigateByUrl(`/pacientes/${id}/consultas/nueva`); }
  irAlHistorial(id: number)     { this.router.navigateByUrl(`/pacientes/${id}/consultas`); }
  irAlPlanNutricional(id: number) { this.router.navigateByUrl(`/pacientes/${id}/plan`); }
  irAEditar(id: number)         { this.router.navigateByUrl(`/pacientes/${id}/editar`); }
  irAgregarTurno(id: number)    { this.router.navigateByUrl(`/turnos/${id}/nuevo`); }
  volver()                      { this.router.navigateByUrl('/pacientes'); }
}
