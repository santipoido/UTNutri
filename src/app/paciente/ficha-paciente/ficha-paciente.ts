import { Component, computed, inject, signal } from '@angular/core';
import { PacienteClient } from '../paciente-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Consulta, Paciente } from '../paciente';
import { ClienteTurnos } from '../../turnos/cliente-turnos';
import { Turno } from '../../turnos/turno';
import { DatePipe } from '@angular/common';
import { AppModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-ficha-paciente',
  imports: [DatePipe, AppModalComponent],
  templateUrl: './ficha-paciente.html',
  styleUrl: './ficha-paciente.css'
})
export class FichaPaciente {
  protected readonly client = inject(PacienteClient);
  private readonly clienteTurnos = inject(ClienteTurnos);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  paciente = signal<Paciente | null>(null);
  consultas = signal<Consulta[]>([]);
  proximosTurnos = signal<Turno[]>([]);

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
  // ─────────────────────────────────────────────────────────────────────────

  ultimaConsulta = computed<Consulta | null>(() => {
    const ordenadas = [...this.consultas()].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    return ordenadas[0] ?? null;
  });

  ultimoPesoKg = computed<number | null>(() => this.ultimaConsulta()?.peso ?? null);
  ultimaFecha = computed<string | null>(() => this.ultimaConsulta()?.fecha ?? null);

  pacienteDesde = computed<string | null>(() => {
    if (!this.consultas().length) return null;
    const ordenadasAsc = [...this.consultas()].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    return ordenadasAsc[0]?.fecha ?? null;
  });

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
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const proximos = turnos
          .filter(t => t.estado === 'Pendiente' && new Date(t.fecha) >= hoy)
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        this.proximosTurnos.set(proximos);
      },
      error: () => this.proximosTurnos.set([])
    });
  }

  irAgregarConsulta(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/consultas/nueva`);
  }

  irAlHistorial(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/consultas`);
  }

  irAlPlanNutricional(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/plan`);
  }

  irAEditar(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/editar`);
  }

  irAgregarTurno(id: number) {
    this.router.navigateByUrl(`/turnos/${id}/nuevo`);
  }

  volver() {
    this.router.navigateByUrl('/pacientes');
  }
}