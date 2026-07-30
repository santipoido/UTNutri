import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteClient } from '../paciente-client';
import { ActivatedRoute, Router } from '@angular/router';
import { AppModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-form-pacientes',
  imports: [ReactiveFormsModule, AppModalComponent],
  templateUrl: './form-pacientes.html',
  styleUrl: './form-pacientes.css'
})
export class FormPacientes implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isEditing = signal(false);
  private readonly rawId = this.route.snapshot.paramMap.get('id');
  protected readonly id = this.rawId ? Number(this.rawId) : null;

  private static readonly NOMBRE_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/;
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  errorMsg = '';

  protected readonly generos = ['Masculino', 'Femenino', 'Otro'];
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly minFechaNacimiento = new Date(
    new Date().setFullYear(new Date().getFullYear() - 120)
  ).toISOString().slice(0, 10);

  protected readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(FormPacientes.NOMBRE_PATTERN)]],
    genero: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.pattern(FormPacientes.EMAIL_PATTERN), Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(/^[0-9]+$/)]]
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

  get nombre() { return this.form.controls.nombre; }
  get genero() { return this.form.controls.genero; }
  get fechaNacimiento() { return this.form.controls.fechaNacimiento; }
  get correo() { return this.form.controls.correo; }
  get telefono() { return this.form.controls.telefono; }

  ngOnInit(): void {
    if (this.id) {
      this.isEditing.set(true);
      this.client.getPacienteById(this.id).subscribe({
        next: (paciente) => {
          this.form.patchValue({
            nombre: paciente.nombre ?? '',
            genero: paciente.genero ?? '',
            fechaNacimiento: paciente.fechaNacimiento ?? '',
            correo: paciente.correo ?? '',
            telefono: paciente.telefono ?? '',
          });
        }
      });
    }
  }

  volver() {
    if (this.isEditing()) {
      this.router.navigateByUrl(`/pacientes/${this.id}/ficha`);
    } else {
      this.router.navigateByUrl('/pacientes');
    }
  }

  private mensajeDeError(err: any): string | null {
    if (err.status === 409) {
      return err.error?.error ?? 'Ya tenés un paciente con ese correo o teléfono.';
    }
    if (err.status === 400 && err.error?.detalles) {
      return Object.values(err.error.detalles).join(' ');
    }
    return null;
  }

  handleSubmit() {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.getRawValue();

    this.openConfirmModal(
      this.isEditing() ? 'Guardar cambios' : 'Agregar paciente',
      '¿Querés confirmar los datos del paciente?',
      () => {
        if (this.isEditing()) {
          this.client.updatePaciente(this.id!, dto).subscribe({
            next: () => this.openInfoModal('¡Listo!', 'Paciente modificado con éxito.', () => {
              this.router.navigateByUrl(`/pacientes/${this.id}/ficha`);
            }),
            error: (err) => {
              const msg = this.mensajeDeError(err);
              if (msg) {
                this.errorMsg = msg;
              } else {
                this.openInfoModal('Error', 'No se pudo modificar el paciente. Intentá más tarde.', () => {
                  this.router.navigateByUrl(`/pacientes/${this.id}/ficha`);
                });
              }
            }
          });
        } else {
          this.client.addPaciente(dto).subscribe({
            next: (pacienteCreado) => this.openInfoModal(
              '¡Listo!',
              `Paciente "${pacienteCreado.nombre}" agregado con éxito.`,
              () => { this.form.reset(); this.router.navigateByUrl('/pacientes'); }
            ),
            error: (err) => {
              const msg = this.mensajeDeError(err);
              if (msg) {
                this.errorMsg = msg;
              } else {
                this.openInfoModal('Error', 'No se pudo guardar el paciente. Intentá más tarde.');
              }
            }
          });
        }
      }
    );
  }
}
