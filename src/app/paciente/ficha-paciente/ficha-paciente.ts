import { Component, computed, inject, signal } from '@angular/core';
import { PacienteClient } from '../paciente-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Consulta, Paciente } from '../paciente';

@Component({
  selector: 'app-ficha-paciente',
  imports: [],
  templateUrl: './ficha-paciente.html',
  styleUrl: './ficha-paciente.css'
})
export class FichaPaciente {
  protected readonly client = inject(PacienteClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  paciente = signal<Paciente | null>(null);
  consultas = signal<Consulta[]>([]);

  ultimaConsulta = computed<Consulta | null>(() => {
    const ordenadas = [...this.consultas()].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    return ordenadas[0] ?? null;
  });

  ultimoPesoKg = computed<number | null>(() => this.ultimaConsulta()?.peso ?? null);
  ultimaFecha = computed<string | null>(() => this.ultimaConsulta()?.fecha ?? null);

  pacienteDesde = computed<string | null>(() => {
    if (!this.consultas().length) return null;
    const ordenadasAsc = [...this.consultas()].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    return ordenadasAsc[0]?.fecha ?? null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')!);

    this.client.getPacienteById(id).subscribe({
      next: p => this.paciente.set(p),
      error: () => alert('Paciente no encontrado')
    });

    this.client.getConsultas(id).subscribe({
      next: c => this.consultas.set(c),
      error: () => this.consultas.set([])
    });
  }

  irAgregarConsulta(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/consultas/nueva`);
  }

  irAlHistorial(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/consultas`);
  }

  irAlPlanNutricional(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/plan`);
  }

  irAEditar(id: number) {
    this.router.navigateByUrl(`/pacientes/${id}/editar`);
  }

  irAgregarTurno(id: number) {
    this.router.navigateByUrl(`/turnos/${id}/nuevo`);
  }
}