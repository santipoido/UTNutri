import { Component, inject, linkedSignal, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteTurnos } from '../cliente-turnos';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { Turno } from '../turno';
import { of } from 'rxjs';
import { AppModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-form-turnos',
  imports: [ReactiveFormsModule, AppModalComponent],
  templateUrl: './form-turnos.html',
  styleUrl: './form-turnos.css',
})
export class FormTurnos {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(ClienteTurnos);
  private readonly pacienteClient = inject(PacienteClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly rawPacienteId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('pacienteId');
  private readonly rawTurnoId = this.route.snapshot.paramMap.get('turnoId');

  private readonly idPaciente = this.rawPacienteId ? Number(this.rawPacienteId) : null;
  private readonly turnoId = this.rawTurnoId ? Number(this.rawTurnoId) : null;

  private readonly pacienteSource = toSignal(
    this.idPaciente ? this.pacienteClient.getPacienteById(this.idPaciente) : of(null)
  );
  protected readonly paciente = linkedSignal(() => this.pacienteSource());
  protected readonly esEdicion = signal(!!this.turnoId);

  errorMsg = '';

  private readonly turnoSource = toSignal(
    this.turnoId ? this.client.getTurnoById(this.turnoId) : of(null as any)
  );

  private readonly turnosSource = toSignal(
    this.client.getProximosTurnos(),
    { initialValue: [] }
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    observaciones: [''],
  });

  // ── Modal state ──────────────────────────────────────────────────────────
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmLabel = 'Aceptar';
  modalType: 'info' | 'confirm' | 'danger' = 'info';
  private pendingAction: (() => void) | null = null;

  private openInfoModal(title: string, message: string, onAccept?: () => void): void {
    this.modalTitle        = title;
    this.modalMessage      = message;
    this.modalConfirmLabel = 'Aceptar';
    this.modalType         = 'info';
    this.pendingAction     = onAccept ?? null;
    this.modalVisible      = true;
  }

  private openConfirmModal(title: string, message: string, action: () => void): void {
    this.modalTitle        = title;
    this.modalMessage      = message;
    this.modalConfirmLabel = 'Confirmar';
    this.modalType         = 'confirm';
    this.pendingAction     = action;
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

  constructor() {
    effect(() => {
      const turno = this.turnoSource();
      if (turno && this.esEdicion()) {
        const fecha = new Date(turno.fecha);
        const fechaFormato = fecha.toISOString().split('T')[0];
        this.form.patchValue({
          fecha: fechaFormato,
          hora: turno.hora,
          observaciones: turno.observaciones,
        });
      }
    });
  }

  get fecha() { return this.form.controls.fecha; }
  get hora() { return this.form.controls.hora; }
  get observaciones() { return this.form.controls.observaciones; }

  volver() {
    if (this.esEdicion()) {
      this.router.navigateByUrl('/turnos');
    } else {
      this.router.navigateByUrl(`/pacientes/${this.idPaciente}/ficha`);
    }
  }

  private turnoEsEnElPasado(fecha: string, hora: string): boolean {
    const [year, month, day] = fecha.split('-').map(Number);
    const [h, m] = hora.split(':').map(Number);
    const fechaTurno = new Date(year, month - 1, day, h, m, 0, 0);
    return fechaTurno.getTime() <= new Date().getTime();
  }

  private turnosOcupados(fecha: string, hora: string): boolean {
    const turnos = this.turnosSource();
    const [year, month, day] = fecha.split('-').map(Number);
    const [h, m] = hora.split(':').map(Number);
    const fechaNueva = new Date(year, month - 1, day, h, m);
    const MEDIA_HORA = 30 * 60 * 1000;

    return turnos.some((t: Turno) => {
      const fechaTurno = new Date(t.fecha);
      const [h2, m2] = t.hora.split(':').map(Number);
      fechaTurno.setHours(h2, m2, 0, 0);
      if (this.esEdicion() && t.id === this.turnoId) return false;
      return Math.abs(fechaTurno.getTime() - fechaNueva.getTime()) < MEDIA_HORA;
    });
  }

  protected horaFueraDeRango(hora: string): boolean {
    const [horaIngresada] = hora.split(':').map(Number);
    return horaIngresada < 7 || horaIngresada > 19;
  }

  handleSubmit() {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Completá todos los campos antes de continuar.';
      return;
    }

    const { fecha, hora, observaciones } = this.form.getRawValue();

    if (this.horaFueraDeRango(hora)) {
      this.errorMsg = 'El horario debe estar entre las 07:00 y las 19:00.';
      return;
    }
    if (this.turnoEsEnElPasado(fecha, hora)) {
      this.errorMsg = 'La fecha y hora del turno deben ser futuras.';
      return;
    }
    if (this.turnosOcupados(fecha, hora)) {
      this.errorMsg = 'Ya existe un turno programado para esa fecha y hora.';
      return;
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const fechaLocal = new Date(year, month - 1, day, 0, 0, 0, 0);

    const dto: Omit<Turno, 'id'> = {
      idPaciente: this.idPaciente!,
      fecha: fechaLocal,
      hora,
      observaciones,
      estado: this.esEdicion() ? this.turnoSource()?.estado ?? 'Pendiente' : 'Pendiente'
    };

    this.openConfirmModal(
      this.esEdicion() ? 'Reprogramar turno' : 'Agendar turno',
      '¿Querés confirmar los datos del turno?',
      () => {
        if (this.esEdicion()) {
          this.client.updateTurno(this.turnoId!, dto).subscribe({
            next: () => this.openInfoModal('¡Listo!', 'El turno fue actualizado con éxito.', () => {
              this.form.reset();
              this.router.navigateByUrl('/turnos');
            }),
            error: () => this.openInfoModal('Error', 'No se pudo actualizar el turno. Intentá más tarde.')
          });
        } else {
          this.client.addTurno(dto).subscribe({
            next: () => this.openInfoModal('¡Listo!', 'El turno fue agendado con éxito.', () => {
              this.form.reset();
              this.router.navigateByUrl('/pacientes');
            }),
            error: () => this.openInfoModal('Error', 'No se pudo guardar el turno. Intentá más tarde.')
          });
        }
      }
    );
  }
}
