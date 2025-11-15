import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteClient } from '../paciente-client';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdatePacienteDto } from '../paciente';

@Component({
  selector: 'app-form-pacientes',
  imports: [ReactiveFormsModule],
  templateUrl: './form-pacientes.html',
  styleUrl: './form-pacientes.css'
})
export class FormPacientes implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);


  protected readonly isEditing = signal(false);
  protected readonly id = this.route.snapshot.paramMap.get('id');

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

  ngOnInit(): void {
    if(this.id){
      this.isEditing.set(true);

      this.client.getPacienteById(this.id).subscribe({
        next: (paciente) => {
          this.form.patchValue(
            {
              nombre: paciente.nombre ?? '',
              genero: paciente.genero ?? '',
              fechaNacimiento: paciente.fechaNacimiento ?? '',
              correo: paciente.correo ?? '',
              telefono: paciente.telefono ?? '',
            }
          )
        }
      })
    }
  }

  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert("El formulario es inválido.");
      return;
    }

    if (confirm('¿Desea confirmar los datos?')) {

    const dto = this.form.getRawValue();


    if(this.isEditing()){
      

      this.client.updatePaciente(dto, this.id!).subscribe({
        next: () => {
          alert('Paciente modificado con exito');
          this.router.navigateByUrl(`pacientes/${this.id}/ficha`);
        }, error: () => {
          alert('No se pudo modificar el paciente');
          this.router.navigateByUrl(`pacientes/${this.id}/ficha`);
        }
      })
    } else{

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
}
