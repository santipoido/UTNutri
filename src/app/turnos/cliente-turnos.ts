import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Turno } from './turno';

@Injectable({
  providedIn: 'root'
})
export class ClienteTurnos {
  private readonly http = inject(HttpClient);
  private readonly urlProximosTurnos = 'http://localhost:3000/turnos';

  getProximosTurnos(){
    return this.http.get<Turno[]>(this.urlProximosTurnos);
  }

  getTurnoById(id: string | number){
    return this.http.get<Turno>(`${this.urlProximosTurnos}/${id}`);
  }

  addProximaConuslta(proxTurno: Turno){
    return this.http.post<Turno>(this.urlProximosTurnos, proxTurno);
  }

  updateTurno(proxTurno: Turno, id: string | number){
    return this.http.put<Turno>(`${this.urlProximosTurnos}/${id}`, proxTurno);
  }

  deleteTurno(id: string | number){
    return this.http.delete<Turno>(`${this.urlProximosTurnos}/${id}`)
  }

  cancelarTurno(id: string | number) {
  return this.http.patch<Turno>(`${this.urlProximosTurnos}/${id}`, {
    estado: 'Cancelado'
  });
}


  
}
