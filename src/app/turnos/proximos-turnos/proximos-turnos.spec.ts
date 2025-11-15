import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProximosTurnos } from './proximos-turnos';

describe('ProximosTurnos', () => {
  let component: ProximosTurnos;
  let fixture: ComponentFixture<ProximosTurnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximosTurnos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProximosTurnos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
