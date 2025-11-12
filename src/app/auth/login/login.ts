import { Component, inject } from '@angular/core';
import { AuthService } from '../auth-service';
import { Router } from '@angular/router';
import { flatMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  error = false;

  private readonly formBuilder = inject(FormBuilder);
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  get username(){
    return this.form.controls.username;
  }

  get password(){
    return this.form.controls.password;
  }

  constructor() {
    // Cuando el usuario escribe, se limpia el error
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
    const ok = this.auth.login(username, password);

    if (!ok) {
      this.form.setErrors({ ...(this.form.errors ?? {}), invalidCredentials: true });
      return;
    }

    this.router.navigateByUrl('/');
  }
}

