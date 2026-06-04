import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { Consulta, Paciente } from '../../paciente/paciente';

@Component({
  selector: 'app-historial-consultas',
  imports: [],
  templateUrl: './historial-consultas.html',
  styleUrl: './historial-consultas.css'
})
export class HistorialConsultas {

  private readonly route = inject(ActivatedRoute);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);

  private readonly id = Number(this.route.snapshot.paramMap.get('id')!);

  paciente = signal<Paciente | null>(null);
  consultas = signal<Consulta[]>([]);

  ngOnInit(): void {
    this.client.getPacienteById(this.id).subscribe({
      next: p => this.paciente.set(p),
      error: () => alert('Paciente no encontrado')
    });

    this.client.getConsultas(this.id).subscribe({
      next: c => this.consultas.set(c),
      error: () => this.consultas.set([])
    });
  }

  irANuevaConsulta() {
    this.router.navigateByUrl(`/pacientes/${this.id}/consultas/nueva`);
  }
}