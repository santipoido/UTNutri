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

  // estado como signal
  paciente = signal<Paciente | null>(null);

  // última consulta calculada (ordena por fecha desc)
  ultimaConsulta = computed<Consulta | null>(() => {
    const p = this.paciente();
    if (!p || !p.consultas?.length) return null;

    const ordenadas = [...p.consultas].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    return ordenadas[0] ?? null;
  });

  // valores derivados para el template
  ultimoPesoKg = computed<number | null>(() => this.ultimaConsulta()?.peso ?? null);
  ultimaFecha = computed<string | null>(() => this.ultimaConsulta()?.fecha ?? null);


  pacienteDesde = computed<string | null>(() => {
    const p = this.paciente();
    if (!p || !p.consultas?.length) return null;

    const ordenadasAsc = [...p.consultas].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    const primera = ordenadasAsc[0];
    return primera?.fecha ?? null;
  })

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.client.getPacienteById(id).subscribe({
      next: p => this.paciente.set(p),
      error: () => {
        alert('Paciente no encontrado');
      }
    });
  }

  irAgregarConsulta(id: string | number) {
    this.router.navigateByUrl(`/pacientes/${id}/consultas/nueva`);
  }


}
