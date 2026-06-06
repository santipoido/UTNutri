import { Component, inject, signal, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, NgClass } from '@angular/common';
import { map } from 'rxjs/operators';
import { ClienteTurnos } from '../cliente-turnos';
import { Router } from '@angular/router';
import { Turno } from '../turno';

@Component({
  selector: 'app-proximos-turnos',
  imports: [NgClass, DatePipe],
  templateUrl: './proximos-turnos.html',
  styleUrl: './proximos-turnos.css',
})
export class ProximosTurnos {
  private readonly client = inject(ClienteTurnos);
  private readonly router = inject(Router);

  protected readonly turnos = toSignal(
    this.client.getProximosTurnos().pipe(
      map((turnos: Turno[]) =>
        turnos
          .map(t => {
            const fechaTurno = new Date(t.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaTurno.setHours(0, 0, 0, 0);
            const estaVencido = fechaTurno < hoy;
            const estadoActualizado = t.estado === 'Pendiente' && estaVencido ? 'Realizado' : t.estado;
            return { ...t, fecha: new Date(t.fecha), estado: estadoActualizado };
          })
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      )
    )
  );

  protected readonly filtroEstado = signal<'Todos' | 'Pendiente' | 'Realizado' | 'Cancelado'>('Todos');

  protected readonly turnosFiltrados = linkedSignal(() => {
    const filtro = this.filtroEstado();
    const lista = this.turnos() ?? [];
    const filtrados = filtro === 'Todos' ? lista : lista.filter(t => t.estado === filtro);
    return this.ordenarTurnosPorFecha(filtrados);
  });

  editarTurno(id: number) {
    const turno = this.turnos()?.find(t => t.id === id);
    if (turno) {
      this.router.navigateByUrl(`/turnos/${turno.idPaciente}/editar/${id}`);
    } else {
      alert('No se pudo encontrar el turno');
    }
  }

  eliminarTurno(id: number) {
    if (window.confirm('¿Desea eliminar el turno?')) {
      this.client.deleteTurno(id).subscribe({
        next: () => { alert('Turno eliminado con éxito'); window.location.reload(); },
        error: () => alert('No pudimos eliminar el turno. Intentalo más tarde.')
      });
    }
  }

  cancelarTurno(id: number) {
    if (!confirm('¿Desea cancelar este turno?')) return;
    this.client.cancelarTurno(id).subscribe({
      next: () => { alert('Turno cancelado con éxito'); window.location.reload(); },
      error: () => alert('No pudimos cancelar el turno. Intente nuevamente.')
    });
  }

  onFiltroChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value as any);
  }

  ordenarTurnosPorFecha(turnos: Turno[]) {
    const hoy = new Date();
    return [...turnos].sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      const esPasadoA = fechaA < hoy;
      const esPasadoB = fechaB < hoy;
      if (esPasadoA && !esPasadoB) return 1;
      if (!esPasadoA && esPasadoB) return -1;
      return fechaA.getTime() - fechaB.getTime();
    });
  }
}
