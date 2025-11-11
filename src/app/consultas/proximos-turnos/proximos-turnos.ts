import { Component, inject } from '@angular/core';
import { ClienteTurnos } from '../cliente-turnos';
import { toSignal } from '@angular/core/rxjs-interop'
import { PacienteClient

 } from '../../paciente/paciente-client';
@Component({
  selector: 'app-proximos-turnos',
  imports: [],
  templateUrl: './proximos-turnos.html',
  styleUrl: './proximos-turnos.css',
})
export class ProximosTurnos {
  private readonly client = inject(ClienteTurnos);
  private readonly pacienteClient = inject(PacienteClient);



  protected readonly turnos = toSignal(this.client.getProximosTurnos());
  protected readonly pacientes = toSignal(this.pacienteClient.getPacientes());

  obtenerPaciente(id: string | number) {
    const listaPacientes = this.pacientes(); 

    if(!listaPacientes) return 'Cargando...'

    const paciente = listaPacientes.find(paciente => paciente.id === id);
    return paciente ? paciente.nombre : 'Paciente desconocido';
  }

}
