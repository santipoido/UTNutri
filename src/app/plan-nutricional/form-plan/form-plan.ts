import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { Paciente, PlanNutricional } from '../../paciente/paciente';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

const EMPTY_PLAN: PlanNutricional = {
  desayuno: '',
  almuerzo: '',
  merienda: '',
  cena: '',
  snacks: '',
  notas: ''
};

@Component({
  selector: 'app-form-plan',
  imports: [ReactiveFormsModule],
  templateUrl: './form-plan.html',
  styleUrl: './form-plan.css'
})
export class FormPlan implements OnInit {

  private readonly fb = inject(FormBuilder)
  private readonly route = inject(ActivatedRoute);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);

  loading = signal(false);
  pacienteId = signal<string | number | null>(null);
  isLoaded = signal(false);
  isEdit = computed(() => this.pacienteId !== null && this.isLoaded());

  readonly form = this.fb.nonNullable.group({
    desayuno: [EMPTY_PLAN.desayuno],
    almuerzo: [EMPTY_PLAN.almuerzo],
    merienda: [EMPTY_PLAN.merienda],
    cena: [EMPTY_PLAN.cena],
    snacks: [EMPTY_PLAN.snacks],
    notas: [EMPTY_PLAN.notas]
  });

  get desayuno() { return this.form.controls.desayuno; }
  get almuerzo() { return this.form.controls.almuerzo; }
  get merienda() { return this.form.controls.merienda; }
  get cena() { return this.form.controls.cena; }
  get snacks() { return this.form.controls.snacks; }
  get notas() { return this.form.controls.notas; }

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      if (id) {
        this.pacienteId.set(id);
        this.cargarPacienteYPlan(id);
      } else {
        this.pacienteId.set(null);
        this.isLoaded.set(false);
        this.form.reset(EMPTY_PLAN);
      }
    });
  }

  private cargarPacienteYPlan(id: string | number) {
    this.loading.set(true);
    this.isLoaded.set(false);

    this.client.getPacienteById(id).subscribe({
      next: paciente => {
        const pPlan = (paciente?.planNutricional) ? paciente.planNutricional : EMPTY_PLAN;

        this.form.patchValue({
          desayuno: pPlan.desayuno ?? '',
          almuerzo: pPlan.almuerzo ?? '',
          merienda: pPlan.merienda ?? '',
          cena: pPlan.cena ?? '',
          snacks: pPlan.snacks ?? '',
          notas: pPlan.notas ?? ''
        });

        this.loading.set(false);
        this.isLoaded.set(true);
      },
      error: (err) => {
        console.error('Error cargando paciente', err);
        this.loading.set(false);
        this.isLoaded.set(false);
        alert('No se pudo cargar el paciente. Revisá la consola.');
      }
    });
  }

  handleSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    alert('El formulario contiene errores.');
    return;
  }

  const id = this.pacienteId();
  if (!id) {
    alert('No hay paciente seleccionado.');
    return;
  }

  const plan = this.form.getRawValue(); 
  this.loading.set(true);

  this.client.updatePacientePlan(id, plan).subscribe({
    next: () => {
      this.loading.set(false);
      this.form.markAsPristine();
      alert('Plan guardado.');
      this.router.navigate(['/pacientes', id, 'plan']);
    },
    error: (err) => {
      console.error(err);
      this.loading.set(false);
      alert('No se pudo guardar el plan.');
    }
  });
}



}
