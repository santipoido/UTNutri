import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { PlanNutricional } from '../../paciente/paciente';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

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

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);

  loading = signal(false);
  pacienteId = signal<number | null>(null);
  isLoaded = signal(false);
  isEdit = computed(() => this.pacienteId() !== null && this.isLoaded());

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
        this.pacienteId.set(Number(id));
        this.cargarPlan(Number(id));
      } else {
        this.pacienteId.set(null);
        this.isLoaded.set(false);
        this.form.reset(EMPTY_PLAN);
      }
    });
  }

  private cargarPlan(id: number) {
    this.loading.set(true);
    this.isLoaded.set(false);

    this.client.getPlan(id).subscribe({
      next: plan => {
        this.form.patchValue(plan ?? EMPTY_PLAN);
        this.loading.set(false);
        this.isLoaded.set(true);
      },
      error: () => {
        // Si no tiene plan todavía (404) dejamos el form vacío
        this.form.reset(EMPTY_PLAN);
        this.loading.set(false);
        this.isLoaded.set(true);
      }
    });
  }

  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.pacienteId();
    if (!id) return;

    const plan = this.form.getRawValue();
    this.loading.set(true);

    this.client.upsertPlan(id, plan).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.markAsPristine();
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