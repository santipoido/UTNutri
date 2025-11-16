import { Component, inject, linkedSignal, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteTurnos } from '../cliente-turnos';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { Turno } from '../turno';
import { of } from 'rxjs';

@Component({
  selector: 'app-form-turnos',
  imports: [ReactiveFormsModule],
  templateUrl: './form-turnos.html',
  styleUrl: './form-turnos.css',
})
export class FormTurnos {
  private readonly formBuilder = inject(FormBuilder);
  private readonly client = inject(ClienteTurnos);
  private readonly pacienteClient = inject(PacienteClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly idPaciente = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('pacienteId');
  private readonly turnoId = this.route.snapshot.paramMap.get('turnoId');
  private readonly pacienteSource = toSignal(this.pacienteClient.getPacienteById(this.idPaciente!));
  protected readonly paciente = linkedSignal(() => this.pacienteSource());
  protected readonly esEdicion = signal(!!this.turnoId);
  private readonly turnoSource = toSignal(
    this.turnoId ? this.client.getTurnoById(this.turnoId) : of(null as any)
  );


  protected readonly form = this.formBuilder.nonNullable.group({
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    observaciones: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const turno = this.turnoSource();
      if (turno && this.esEdicion()) {
        const fecha = new Date(turno.fecha);
        const fechaFormato = fecha.toISOString().split('T')[0];
        this.form.patchValue({
          fecha: fechaFormato,
          hora: turno.hora,
          observaciones: turno.observaciones,
        });
      }
    });
  }

  get fecha() { return this.form.controls.fecha; }
  get hora() { return this.form.controls.hora; }
  get observaciones() { return this.form.controls.observaciones; }

  private turnoEsEnElPasado(fecha: string, hora: string): boolean {
    const [year, month, day] = fecha.split('-').map(Number);
    const [h, m] = hora.split(':').map(Number);

    // Fecha del turno en horario LOCAL
    const fechaTurno = new Date(year, month - 1, day, h, m, 0, 0);

    const ahora = new Date();

    // true si el turno es pasado o exactamente ahora
    return fechaTurno.getTime() <= ahora.getTime();
  }

  private horaFueraDeRango(hora: string): boolean {
    const [horaIngresada, minutosIngresados] = hora.split(':').map(Number);

    const HORA_MINIMA = 7;   // 07:00
    const HORA_MAXIMA = 19;  // 19:00

    const esAntesDeLaHoraMinima = horaIngresada < HORA_MINIMA;
    const esDespuesDeLaHoraMaxima = horaIngresada > HORA_MAXIMA;

    return esAntesDeLaHoraMinima || esDespuesDeLaHoraMaxima;
  }


  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert("El formulario es inválido.");
      return;
    }

    const raw = this.form.getRawValue();
    const { fecha, hora, observaciones } = raw;

    // El turno NO puede ser en el pasado
    if (this.turnoEsEnElPasado(fecha, hora)) {
      alert("La fecha y hora del turno deben ser futuras.");
      return;
    }

    // El horario debe estar entre 07:00 y 19:00
    if (this.horaFueraDeRango(hora)) {
      alert("El horario debe estar entre las 07:00 y las 19:00.");
      return;
    }

    if (confirm('¿Desea confirmar los datos?')) {
      const [year, month, day] = fecha.split('-').map(Number);
      const fechaLocal = new Date(year, month - 1, day, 0, 0, 0, 0);

      const dto: Turno = {
        idPaciente: this.idPaciente!,
        fecha: fechaLocal,
        hora: hora,
        observaciones: observaciones,
        estado: this.esEdicion() ? this.turnoSource()?.estado || 'Pendiente' : 'Pendiente'
      };

      if (this.esEdicion()) {
        // Editar turno existente
        this.client.updateTurno(dto, this.turnoId!).subscribe({
          next: (turnoActualizado) => {
            alert(`El turno del ${turnoActualizado.fecha} fue actualizado con éxito`);
            this.form.reset();
            this.router.navigateByUrl('/turnos');
          },
          error: () => {
            alert('Error al actualizar el turno en el servidor.');
          }
        });
      } else {
        // Crear nuevo turno
        this.client.addProximaConuslta(dto).subscribe({
          next: (turnoCreado) => {
            alert(`El turno en la fecha "${turnoCreado.fecha}" fue agregado con éxito`);
            this.form.reset();
            this.router.navigateByUrl('/pacientes');
          },
          error: () => {
            alert('Error al guardar el turno en el servidor.');
          }
        });
      }
    }
  }
}
