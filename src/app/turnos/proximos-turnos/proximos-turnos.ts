import { Component, inject, signal, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { ClienteTurnos } from '../cliente-turnos';
import { Router } from '@angular/router';
import { Turno } from '../turno';
import { AppModalComponent } from '../../components/modal/modal';
import { AppEmptyStateComponent } from '../../components/empty-state/empty-state';

@Component({
  selector: 'app-proximos-turnos',
  imports: [DatePipe, AppModalComponent, AppEmptyStateComponent],
  templateUrl: './proximos-turnos.html',
  styleUrl: './proximos-turnos.css',
})
export class ProximosTurnos {
  private readonly client = inject(ClienteTurnos);
  private readonly router = inject(Router);

  protected readonly turnos = toSignal(
    this.client.getTurnos().pipe(
      map((turnos: Turno[]) =>
        turnos
          .map(t => {
            const fechaTurno = new Date(t.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaTurno.setHours(0, 0, 0, 0);
            const estaVencido = fechaTurno < hoy;
            const estadoActualizado = t.estado === 'Pendiente' && estaVencido ? 'Realizado' : t.estado;
            return { ...t, fecha: new Date(t.fecha), estado: estadoActualizado };
          })
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      )
    )
  );

  protected readonly filtroEstado = signal<'Todos' | 'Pendiente' | 'Realizado' | 'Cancelado'>('Todos');

  protected today = new Date();
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmLabel = 'Confirmar';
  modalType: 'confirm' | 'danger' = 'confirm';
  errorMsg = '';
  private pendingAction: (() => void) | null = null;

  protected readonly turnosFiltrados = linkedSignal(() => {
    const filtro = this.filtroEstado();
    const lista = this.turnos() ?? [];
    const filtrados = filtro === 'Todos' ? lista : lista.filter(t => t.estado === filtro);
    return this.ordenarTurnosPorFecha(filtrados);
  });

  private openModal(
    config: { title: string; message: string; confirmLabel: string; type: 'confirm' | 'danger' },
    action: () => void
  ): void {
    this.modalTitle        = config.title;
    this.modalMessage      = config.message;
    this.modalConfirmLabel = config.confirmLabel;
    this.modalType         = config.type;
    this.pendingAction     = action;
    this.modalVisible      = true;
  }

  onModalConfirmado(): void {
    this.pendingAction?.();
    this.pendingAction = null;
    this.modalVisible  = false;
  }

  onModalCancelado(): void {
    this.pendingAction = null;
    this.modalVisible  = false;
  }

  editarTurno(id: number) {
    const turno = this.turnos()?.find(t => t.id === id);
    if (turno) {
      this.router.navigateByUrl(`/turnos/${turno.idPaciente}/editar/${id}`);
    } else {
      this.errorMsg = 'No se pudo encontrar el turno.';
    }
  }

  eliminarTurno(id: number): void {
    this.openModal(
      {
        title: 'Eliminar turno',
        message: '¿Estás seguro que querés eliminar este turno? Esta acción no se puede deshacer.',
        confirmLabel: 'Sí, eliminar',
        type: 'danger'
      },
      () => this.client.deleteTurno(id).subscribe({
        next: () => location.reload(),
        error: () => { this.errorMsg = 'No pudimos eliminar el turno. Intentalo más tarde.'; }
      })
    );
  }

  cancelarTurno(id: number): void {
    this.openModal(
      {
        title: 'Cancelar turno',
        message: '¿Estás seguro que querés cancelar este turno?',
        confirmLabel: 'Sí, cancelar',
        type: 'confirm'
      },
      () => this.client.cancelarTurno(id).subscribe({
        next: () => location.reload(),
        error: () => { this.errorMsg = 'No pudimos cancelar el turno. Intente nuevamente.'; }
      })
    );
  }

  onFiltroChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value as any);
  }

  ordenarTurnosPorFecha(turnos: Turno[]) {
    const hoy = new Date();
    return [...turnos].sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      const esPasadoA = fechaA < hoy;
      const esPasadoB = fechaB < hoy;
      if (esPasadoA && !esPasadoB) return 1;
      if (!esPasadoA && esPasadoB) return -1;
      return fechaA.getTime() - fechaB.getTime();
    });
  }
}
