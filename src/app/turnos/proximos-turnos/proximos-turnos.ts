import { Component, inject } from '@angular/core';
import { ClienteTurnos } from '../cliente-turnos';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { map } from 'rxjs/operators';
import { signal, linkedSignal } from '@angular/core';

import {
  PacienteClient

} from '../../paciente/paciente-client';
import { Router } from '@angular/router';
@Component({
  selector: 'app-proximos-turnos',
  imports: [NgClass, DatePipe],
  templateUrl: './proximos-turnos.html',
  styleUrl: './proximos-turnos.css',
})
export class ProximosTurnos {
  private readonly client = inject(ClienteTurnos);
  private readonly pacienteClient = inject(PacienteClient);
  private readonly router = inject(Router);


protected readonly turnos = toSignal(
  this.client.getProximosTurnos().pipe(
    map((turnos: any[]) =>
      turnos
        .map(t => {
          // Convertir fecha a Date real
          const fechaTurno = new Date(t.fecha);
          const hoy = new Date();

          // Normalizar horas para comparar solo fechas (evita problemas por hora)
          hoy.setHours(0, 0, 0, 0);
          fechaTurno.setHours(0, 0, 0, 0);

          // Determinar si el turno ya pasó
          const estaVencido = fechaTurno < hoy;

          // Actualizar estado automáticamente
          const estadoActualizado =
            t.estado === 'Pendiente' && estaVencido
              ? 'Realizado'
              : t.estado;

          return {
            ...t,
            fecha: new Date(t.fecha),
            estado: estadoActualizado
          };
        })
        .sort((a, b) => {
          const fechaA = a.fecha.getTime();
          const fechaB = b.fecha.getTime();
          return fechaA - fechaB;
        })
    )
  )
);



  protected readonly pacientes = toSignal(this.pacienteClient.getPacientes());
  protected readonly filtroEstado = signal<'Todos' | 'Pendiente' | 'Realizado' | 'Cancelado'>('Todos');


  protected readonly turnosFiltrados = linkedSignal(() => {
    const filtro = this.filtroEstado();
    const lista = this.turnos() ?? [];

    if (filtro === 'Todos') return lista;

    // Filtrar por estado exacto
    return lista.filter(t => t.estado === filtro);
  });
  obtenerPaciente(id: string | number) {
    const listaPacientes = this.pacientes();

    if (!listaPacientes) return 'Cargando...'

    const paciente = listaPacientes.find(paciente => paciente.id === id);
    return paciente ? paciente.nombre : 'Paciente desconocido';
  }

  editarTurno(id: string | number) {

  }

  /*

  eliminarTurno(id: string | number) {
    if (window.confirm('¿Desea eliminar el turno?')) {
      this.client.deleteTurno(id).subscribe({
        next: () => {
          alert('Turno eliminado con exito');
          window.location.reload();
        }, error: () => {
          alert('No pudimos eliminar el turno! Intentalo mas tarde');
        }
      })
    }
  }
*/

  cancelarTurno(id: string | number) {
    if (!confirm('¿Desea cancelar este turno?')) return;

    this.client.cancelarTurno(id).subscribe({
      next: () => {
        alert('Turno cancelado con éxito');
        window.location.reload();
      },
      error: () => {
        alert('No pudimos cancelar el turno. Intente nuevamente.');
      }
    });
  }

  private refrescarTurnos() {
    this.client.getProximosTurnos().pipe(
      map((turnos: any[]) =>
        turnos.map(t => ({
          ...t,
          fecha: new Date(t.fecha)
        }))
      )
    ).subscribe(nuevaLista => {
      //actualizamos el signal usando writeSignal
      (this.turnos as any).write(nuevaLista);
    });
  }

  onFiltroChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value as any);
  }
}
