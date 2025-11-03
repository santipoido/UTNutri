import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConsultas } from './form-consultas';

describe('FormConsultas', () => {
  let component: FormConsultas;
  let fixture: ComponentFixture<FormConsultas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormConsultas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormConsultas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
