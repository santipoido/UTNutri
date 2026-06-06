import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get nombre() { return this.form.controls.nombre; }
  get username() { return this.form.controls.username; }
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  constructor() {
    this.form.valueChanges.subscribe(() => {
      const errors = this.form.errors;
      if (errors?.['userExists'] || errors?.['registerError']) {
        const { userExists, registerError, ...rest } = errors!;
        this.form.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, username, email, password } = this.form.getRawValue();

    this.auth.register({ nombre, username, email, password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        if (err.status === 409) {
          this.form.setErrors({ ...(this.form.errors ?? {}), userExists: true });
        } else {
          this.form.setErrors({ ...(this.form.errors ?? {}), registerError: true });
        }
      }
    });
  }
}
