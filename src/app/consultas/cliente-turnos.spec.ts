import { TestBed } from '@angular/core/testing';

import { ClienteTurnos } from '../turnos/cliente-turnos';

describe('ClienteTurnos', () => {
  let service: ClienteTurnos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteTurnos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
