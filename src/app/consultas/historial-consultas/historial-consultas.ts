import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { Consulta, Paciente } from '../../paciente/paciente';
import { AppEmptyStateComponent } from '../../components/empty-state/empty-state';

@Component({
  selector: 'app-historial-consultas',
  imports: [AppEmptyStateComponent],
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
  errorMsg = '';

  ngOnInit(): void {
    this.client.getPacienteById(this.id).subscribe({
      next: p => this.paciente.set(p),
      error: () => this.errorMsg = 'No se pudo cargar el paciente.'
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