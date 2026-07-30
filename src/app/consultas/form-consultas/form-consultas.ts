import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { AppModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-form-consultas',
  imports: [ReactiveFormsModule, AppModalComponent],
  templateUrl: './form-consultas.html',
  styleUrl: './form-consultas.css'
})
export class FormConsultas implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly client = inject(PacienteClient);

  pacienteId!: number;
  pacienteNombre: string | null = null;

  readonly today = new Date().toISOString().slice(0, 10);

  form = this.fb.nonNullable.group({
    fecha: [new Date().toISOString().slice(0, 10), [Validators.required]],
    peso: [null as unknown as number, [Validators.required, Validators.min(1), Validators.max(300)]],
    altura: [null as unknown as number, [Validators.required, Validators.min(20), Validators.max(240)]],
    grasa: [null as unknown as number, [Validators.min(0), Validators.max(100)]],
    masa: [null as unknown as number, [Validators.min(0), Validators.max(100)]],
    observaciones: ['']
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

  get peso() { return this.form.controls.peso; }
  get altura() { return this.form.controls.altura; }
  get grasa() { return this.form.controls.grasa; }
  get masa() { return this.form.controls.masa; }
  get observaciones() { return this.form.controls.observaciones; }

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id')!);

    this.client.getPacienteById(this.pacienteId).subscribe({
      next: (p) => { this.pacienteNombre = p.nombre; },
      error: () => this.openInfoModal('Paciente no encontrado', 'No se pudo cargar el paciente.', () => {
        this.router.navigateByUrl('/pacientes');
      })
    });
  }

  irAFicha() {
    this.router.navigateByUrl(`/pacientes/${this.pacienteId}/ficha`);
  }

  irAHistorial() {
    this.router.navigateByUrl(`/pacientes/${this.pacienteId}/consultas`);
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.getRawValue();

    this.openConfirmModal('Agregar consulta', '¿Querés registrar esta consulta?', () => {
      this.client.addConsulta(this.pacienteId, dto).subscribe({
        next: () => this.openInfoModal('¡Listo!', 'Consulta guardada con éxito.', () => {
          this.router.navigateByUrl(`/pacientes/${this.pacienteId}/ficha`);
        }),
        error: () => this.openInfoModal('Error', 'No se pudo guardar la consulta. Intentá más tarde.')
      });
    });
  }

  cancelar(): void {
    this.router.navigateByUrl(`/pacientes/${this.pacienteId}/ficha`);
  }
}
