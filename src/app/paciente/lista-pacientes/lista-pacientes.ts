import { Component, computed, inject, signal, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../paciente-client';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AppModalComponent } from '../../components/modal/modal';
import { AppEmptyStateComponent } from '../../components/empty-state/empty-state';

@Component({
  selector: 'app-lista-pacientes',
  imports: [FormsModule, AppModalComponent, AppEmptyStateComponent, DatePipe],
  templateUrl: './lista-pacientes.html',
  styleUrl: './lista-pacientes.css'
})
export class ListaPacientes {
  protected readonly router = inject(Router);
  protected readonly client = inject(PacienteClient);
  protected readonly route = inject(ActivatedRoute);

  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmLabel = 'Confirmar';
  modalType: 'confirm' | 'danger' = 'danger';
  errorMsg = '';
  private pendingAction: (() => void) | null = null;
  protected readonly pacientes = toSignal(this.client.getPacientes());
  protected readonly termino = signal('');

  protected readonly pacientesFiltrados = linkedSignal(() => {
    const todos = this.pacientes() ?? [];
    const busqueda = this.termino().toLowerCase().trim();
    if (!busqueda) return todos;
    return todos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda) ||
      p.correo.toLowerCase().includes(busqueda) ||
      p.telefono.includes(busqueda)
    );
  });

  protected readonly ITEMS_POR_PAGINA = 10;
  protected readonly paginaActual = signal(1);

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.pacientesFiltrados().length / this.ITEMS_POR_PAGINA))
  );

  protected readonly pacientesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.ITEMS_POR_PAGINA;
    return this.pacientesFiltrados().slice(inicio, inicio + this.ITEMS_POR_PAGINA);
  });

  irAgregarPacientes(): void {
    this.router.navigateByUrl('/pacientes/nuevo');
  }

  irFichaPaciente(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/ficha`);
  }

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

  eliminarPaciente(id: number): void {
    this.openModal(
      {
        title: 'Eliminar paciente',
        message: '¿Estás seguro que querés eliminar este paciente? Esta acción no se puede deshacer.',
        confirmLabel: 'Sí, eliminar',
        type: 'danger'
      },
      () => this.client.deletePaciente(id).subscribe({
        next: () => location.reload(),
        error: () => { this.errorMsg = 'No se pudo eliminar el paciente. Intentalo más tarde.'; }
      })
    );
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 1) this.paginaActual.update(p => p - 1);
  }

  paginaSiguiente(): void {
    if (this.paginaActual() < this.totalPaginas()) this.paginaActual.update(p => p + 1);
  }

  limpiarBusqueda(): void {
    this.termino.set('');
    this.paginaActual.set(1);
  }

  actualizarBusqueda(valor: string): void {
    this.termino.set(valor);
    this.paginaActual.set(1);
  }
}