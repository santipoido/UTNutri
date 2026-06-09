import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth-service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  private readonly formBuilder = inject(FormBuilder);
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  protected readonly showPassword = signal(false);
  togglePassword() { this.showPassword.update(v => !v); }

  get username() {
    return this.form.controls.username;
  }

  get password() {
    return this.form.controls.password;
  }

  constructor() {
    this.form.valueChanges.subscribe(() => {
      if (this.form.errors?.['invalidCredentials']) {
        const { invalidCredentials, ...rest } = this.form.errors!;
        this.form.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.auth.login({ username, password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => {
        this.form.setErrors({ ...(this.form.errors ?? {}), invalidCredentials: true });
      }
    });
  }
}