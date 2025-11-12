import { Component, inject, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { Paciente } from '../../paciente/paciente';

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

 private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly paciente = toSignal<Paciente | null>(
    this.client.getPacienteById(this.id),
    { initialValue: null }
  );

    irAgregarConsulta(id: string | number) {
    this.router.navigateByUrl(`/pacientes/${id}/consultas/nueva`);
  }
}


