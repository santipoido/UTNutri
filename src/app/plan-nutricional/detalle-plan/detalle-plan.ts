import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { Paciente } from '../../paciente/paciente';

@Component({
  selector: 'app-detalle-plan',
  imports: [],
  templateUrl: './detalle-plan.html',
  styleUrl: './detalle-plan.css'
})
export class DetallePlan {

  private readonly route = inject(ActivatedRoute);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);

   private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly paciente = toSignal<Paciente | null>(
    this.client.getPacienteById(this.id),
    { initialValue: null }
  );

  editarPlan(id: string | number){
    this.router.navigateByUrl(`/pacientes/${id}/plan/editar`);
  }
}
