import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteClient } from '../paciente-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-pacientes',
  imports: [ReactiveFormsModule],
  templateUrl: './form-pacientes.html',
  styleUrl: './form-pacientes.css'
})
export class FormPacientes {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);

  protected readonly generos = [
    'Masculino', 'Femenino', 'Otro'
  ]

  protected readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern(/^[0-9]+$/)]]
  });

  get nombre() {
    return this.form.controls.nombre;
  }

  get genero() {
    return this.form.controls.genero;
  }

  get fechaNacimiento() {
    return this.form.controls.fechaNacimiento;
  }
  get correo() {
    return this.form.controls.correo;
  }
  get telefono() {
    return this.form.controls.telefono;
  }

  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert("El formulario es inválido.");
      return;
    }

    if (confirm('¿Desea confirmar los datos?')) {
      const dto = this.form.getRawValue();
      this.client.addPaciente(dto).subscribe({
        next: (pacienteCreado) => {
          alert(`Paciente "${pacienteCreado.nombre}" agregado con éxito (ID: ${pacienteCreado.id})`);
          this.form.reset();
          this.router.navigateByUrl('/pacientes');
        },
        error: () => {
          alert('Error al guardar el paciente en el servidor.');
        }
      });
    }
  }
}
