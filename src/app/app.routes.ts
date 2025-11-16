import { Routes } from '@angular/router';
import { ListaPacientes } from './paciente/lista-pacientes/lista-pacientes';
import { FichaPaciente } from './paciente/ficha-paciente/ficha-paciente';
import { FormPacientes } from './paciente/form-pacientes/form-pacientes';
import { FormConsultas } from './consultas/form-consultas/form-consultas';
import { HistorialConsultas } from './consultas/historial-consultas/historial-consultas';
import { DetallePlan } from './plan-nutricional/detalle-plan/detalle-plan';
import { FormPlan } from './plan-nutricional/form-plan/form-plan';
import { Login } from './auth/login/login';
import { ProximosTurnos } from './turnos/proximos-turnos/proximos-turnos';
import { authGuard } from './auth-guard';
import { loginRedirectGuard } from './login-redirect-guard';
import { FormTurnos } from './turnos/form-turnos/form-turnos';

export const routes: Routes = [
    { path: 'login', canMatch: [loginRedirectGuard], component: Login, data: {hideHeader: true} },

    {
        path: '',
        canMatch: [authGuard],
        children: [
            { path: '', redirectTo: 'turnos', pathMatch: 'full' },

            { path: 'turnos', component: ProximosTurnos },
            { path: 'turnos/:id/nuevo', component: FormTurnos },
            { path: 'turnos/:pacienteId/editar/:turnoId', component: FormTurnos },

            { path: 'pacientes', component: ListaPacientes },
            { path: 'pacientes/nuevo', component: FormPacientes },
            { path: 'pacientes/:id/editar', component: FormPacientes },
            { path: 'pacientes/:id/ficha', component: FichaPaciente },
            { path: 'pacientes/:id/consultas', component: HistorialConsultas },
            { path: 'pacientes/:id/consultas/nueva', component: FormConsultas },
            { path: 'pacientes/:id/plan', component: DetallePlan },
            { path: 'pacientes/:id/plan/editar', component: FormPlan },
        ],
    },

    { path: '**', redirectTo: 'turnos' },
];
