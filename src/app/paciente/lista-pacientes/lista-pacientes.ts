import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../paciente-client';
import { signal, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-pacientes',
  imports: [FormsModule],
  templateUrl: './lista-pacientes.html',
  styleUrl: './lista-pacientes.css'
})
export class ListaPacientes {
  protected readonly router = inject(Router);
  protected readonly client = inject(PacienteClient);
  protected readonly pacientes = toSignal(this.client.getPacientes());
  protected readonly route = inject(ActivatedRoute);
  protected readonly termino = signal('');

  protected readonly pacientesFiltrados = linkedSignal(() => {
    const todos = this.pacientes() ?? [];
    const busqueda = this.termino().toLowerCase().trim();

    if (!busqueda) {
      return todos;
    }

    return todos.filter(paciente =>
      paciente.nombre.toLowerCase().includes(busqueda) ||
      paciente.correo.toLowerCase().includes(busqueda) ||
      paciente.telefono.includes(busqueda)
    );
  });


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

  limpiarBusqueda(): void {
    this.termino.set('');
  }

  actualizarBusqueda(valor: string): void {
    this.termino.set(valor);
  }
}