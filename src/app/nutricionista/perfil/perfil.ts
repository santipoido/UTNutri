import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NutricionistaClient } from '../nutricionista-client';
import { AuthService } from '../../auth/auth-service';
import { AppModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, AppModalComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly client = inject(NutricionistaClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly showPassword = signal(false);
  togglePassword() { this.showPassword.update(v => !v); }

  protected readonly form = this.fb.nonNullable.group({
    nombre:   ['', [Validators.required, Validators.maxLength(150)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.minLength(6)]],
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

  get nombre()   { return this.form.controls.nombre; }
  get username() { return this.form.controls.username; }
  get email()    { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  ngOnInit(): void {
    this.client.getPerfil().subscribe({
      next: (perfil) => {
        this.form.patchValue({
          nombre:   perfil.nombre,
          username: perfil.username,
          email:    perfil.email,
        });
        this.loading.set(false);
      },
      error: () => {
        this.openInfoModal('Error', 'No se pudo cargar el perfil.', () => {
          this.router.navigateByUrl('/turnos');
        });
      }
    });
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openInfoModal('Formulario inválido', 'Revisá los datos antes de guardar.');
      return;
    }

    const { nombre, username, email, password } = this.form.getRawValue();

    this.openConfirmModal('Guardar cambios', '¿Querés actualizar los datos de tu perfil?', () => {
      const request: { nombre: string; username: string; email: string; password?: string } = {
        nombre, username, email,
      };
      if (password.trim()) request.password = password;

      this.client.updatePerfil(request).subscribe({
        next: (actualizado) => {
          this.auth.refreshPerfil(actualizado.nombre, actualizado.username);
          this.form.controls.password.reset('');
          this.form.markAsPristine();
          this.openInfoModal('¡Listo!', 'Tu perfil fue actualizado con éxito.');
        },
        error: (err) => {
          if (err.status === 409) {
            this.openInfoModal('Nombre en uso', 'El username o email ya están en uso por otra cuenta.');
          } else {
            this.openInfoModal('Error', 'No se pudo actualizar el perfil. Intentá más tarde.');
          }
        }
      });
    });
  }
}
