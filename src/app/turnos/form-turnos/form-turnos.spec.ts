import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTurnos } from './form-turnos';

describe('FormTurnos', () => {
  let component: FormTurnos;
  let fixture: ComponentFixture<FormTurnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTurnos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTurnos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
