import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPacientes } from './form-pacientes';

describe('FormPacientes', () => {
  let component: FormPacientes;
  let fixture: ComponentFixture<FormPacientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPacientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPacientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
