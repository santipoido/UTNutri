import { Routes } from '@angular/router';
import { ListaPacientes } from './paciente/lista-pacientes/lista-pacientes';
import { FichaPaciente } from './paciente/ficha-paciente/ficha-paciente';
import { FormPacientes } from './paciente/form-pacientes/form-pacientes';
import { FormConsultas } from './consultas/form-consultas/form-consultas';
import { HistorialConsultas } from './consultas/historial-consultas/historial-consultas';
import { DetallePlan } from './plan-nutricional/detalle-plan/detalle-plan';
import { FormPlan } from './plan-nutricional/form-plan/form-plan';
import { Login } from './auth/login/login';

export const routes: Routes = [
    {path: '', redirectTo: 'pacientes', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'pacientes', component: ListaPacientes},
    {path: 'pacientes/:id/ficha', component: FichaPaciente},
    {path: 'pacientes/nuevo', component: FormPacientes},
    {path: 'pacientes/:id/editar', component: FormPacientes},
    {path: 'pacientes/:id/consultas', component: HistorialConsultas},
    {path: 'pacientes/:id/consultas/nueva', component: FormConsultas},
    {path: 'pacientes/:id/plan', component: DetallePlan},
    {path: 'pacientes/:id/plan/editar', component: FormPlan},
    {path: '**', redirectTo: 'pacientes'}

];
