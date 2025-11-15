import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { Paciente } from '../../paciente/paciente';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  exportarPDF() {
  const elemento = document.getElementById('planNutricionalExportar');

  if (!elemento) return;

   const paciente = this.paciente(); // obtenemos el valor del signal




  html2canvas(elemento, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 190; // ancho en mm
    const pageHeight = 295; // alto A4
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let y = 10;

    pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
    pdf.save(`plan-nutricional-${paciente!.nombre}.pdf`);
  });
}
}
