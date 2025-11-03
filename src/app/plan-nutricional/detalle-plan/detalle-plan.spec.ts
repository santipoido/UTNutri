import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePlan } from './detalle-plan';

describe('DetallePlan', () => {
  let component: DetallePlan;
  let fixture: ComponentFixture<DetallePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
