import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteClient } from '../../paciente/paciente-client';
import { Paciente, PlanNutricional } from '../../paciente/paciente';
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
    const plan = this.plan();
    if (!plan) return;

    const paciente = this.paciente();
    const pdf = new jsPDF('p', 'mm', 'a4');
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 20;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - 15) {
        pdf.addPage();
        y = 20;
      }
    };

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Plan nutricional', marginLeft, y);
    y += 9;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(paciente?.nombre ?? 'Paciente', marginLeft, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setTextColor(110, 110, 110);
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    pdf.text(`Generado el ${fecha}`, marginLeft, y);
    pdf.setTextColor(0, 0, 0);
    y += 4;

    pdf.setDrawColor(210, 210, 210);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;

    const secciones: { titulo: string; texto: string | undefined }[] = [
      { titulo: 'Desayuno', texto: plan.desayuno },
      { titulo: 'Almuerzo', texto: plan.almuerzo },
      { titulo: 'Merienda', texto: plan.merienda },
      { titulo: 'Cena', texto: plan.cena },
      { titulo: 'Snacks', texto: plan.snacks },
      { titulo: 'Notas adicionales', texto: plan.notas },
    ];

    for (const seccion of secciones) {
      const texto = seccion.texto?.trim();
      if (!texto) continue;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      ensureSpace(8);
      pdf.text(seccion.titulo, marginLeft, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10.5);
      const lineas = pdf.splitTextToSize(texto, contentWidth);
      const lineHeight = 5;
      ensureSpace(lineas.length * lineHeight);
      pdf.text(lineas, marginLeft, y);
      y += lineas.length * lineHeight + 6;
    }

    pdf.save(`plan-nutricional-${paciente?.nombre ?? 'paciente'}.pdf`);
  }
}