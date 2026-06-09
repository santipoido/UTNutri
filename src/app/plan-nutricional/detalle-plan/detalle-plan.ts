import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { Paciente, PlanNutricional } from '../../paciente/paciente';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AppEmptyStateComponent } from '../../components/empty-state/empty-state';

@Component({
  selector: 'app-detalle-plan',
  imports: [AppEmptyStateComponent],
  templateUrl: './detalle-plan.html',
  styleUrl: './detalle-plan.css'
})
export class DetallePlan {

  private readonly route = inject(ActivatedRoute);
  private readonly client = inject(PacienteClient);
  private readonly router = inject(Router);

  private readonly id = Number(this.route.snapshot.paramMap.get('id')!);

  paciente = signal<Paciente | null>(null);
  plan = signal<PlanNutricional | null>(null);
  errorMsg = '';

  ngOnInit(): void {
    this.client.getPacienteById(this.id).subscribe({
      next: p => this.paciente.set(p),
      error: () => this.errorMsg = 'No se pudo cargar el paciente.'
    });

    this.client.getPlan(this.id).subscribe({
      next: p => this.plan.set(p),
      error: () => this.plan.set(null)
    });
  }

  editarPlan() {
    this.router.navigateByUrl(`/pacientes/${this.id}/plan/editar`);
  }

  volver() {
    this.router.navigateByUrl(`/pacientes/${this.id}/ficha`);
  }

  exportarPDF() {
    const elemento = document.getElementById('planNutricionalExportar');
    if (!elemento) return;

    const paciente = this.paciente();

    html2canvas(elemento, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 190;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`plan-nutricional-${paciente?.nombre ?? 'paciente'}.pdf`);
    });
  }
}