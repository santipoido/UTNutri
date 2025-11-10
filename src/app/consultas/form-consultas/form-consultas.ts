import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';

@Component({
  selector: 'app-form-consultas',
  imports: [ReactiveFormsModule],
  templateUrl: './form-consultas.html',
  styleUrl: './form-consultas.css'
})
export class FormConsultas implements OnInit{

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly client = inject(PacienteClient);

  pacienteId!: string;
  pacienteNombre: string | null = null;

  form = this.fb.nonNullable.group({
    fecha: [new Date().toISOString().slice(0, 10), [Validators.required]],
    peso: [null as unknown as number, [Validators.required, Validators.min(1)]],
    altura: [null as unknown as number, [Validators.required, Validators.min(50)]],
    grasa: [null as unknown as number],
    masa: [null as unknown as number],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id')!;

    // traemos datos del paciente para mostrar el nombre arriba
    this.client.getPacienteById(this.pacienteId).subscribe({
      next: (p) => {
        this.pacienteNombre = p.nombre;
      },
      error: () => {
        alert('Paciente no encontrado');
        this.router.navigateByUrl('/pacientes/nuevo');
      }
    });
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Formulario de consulta inválido.');
      return;
    }

    const dto = this.form.getRawValue();

    this.client.addConsulta(this.pacienteId, dto).subscribe({
      next: () => {
        alert('Consulta guardada con éxito');
        this.router.navigateByUrl(`/pacientes/${this.pacienteId}/ficha`);
      },
      error: () => {
        alert('Error al guardar la consulta.');
      }
    });
  }

  cancelar(): void {
    this.router.navigateByUrl(`/pacientes/${this.pacienteId}`);
  }
}
