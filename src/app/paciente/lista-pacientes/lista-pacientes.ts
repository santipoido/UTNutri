import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../paciente-client';

@Component({
  selector: 'app-lista-pacientes',
  imports: [],
  templateUrl: './lista-pacientes.html',
  styleUrl: './lista-pacientes.css'
})
export class ListaPacientes {
  protected readonly router = inject(Router);
  protected readonly client = inject(PacienteClient);
  protected readonly pacientes = toSignal(this.client.getPacientes());
  protected readonly route = inject(ActivatedRoute);


  irAgregarPacientes(): void {
    this.router.navigateByUrl('/pacientes/nuevo');
  }

  irFichaPaciente(id: string | number) {
    this.router.navigateByUrl(`/pacientes/${id}/ficha`);
  }

  eliminarPaciente(id: string | number) {
    if (confirm(`¿Desea eliminar al paciente?`)) {
      this.client.deletePaciente(id).subscribe(() => {
        alert('Paciente borrado con éxito');
        location.reload();
      });
    }
  }
}
