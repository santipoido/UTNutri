import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppEmptyStateComponent } from './empty-state';

describe('AppEmptyStateComponent', () => {
  let component: AppEmptyStateComponent;
  let fixture: ComponentFixture<AppEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppEmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the title correctly', () => {
    component.title = 'No hay pacientes';
    fixture.detectChanges();
    const titleEl: HTMLElement = fixture.nativeElement.querySelector('.empty-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent?.trim()).toBe('No hay pacientes');
  });

  it('should show description when provided', () => {
    component.description = 'Agregá tu primer paciente para comenzar.';
    fixture.detectChanges();
    const descEl: HTMLElement = fixture.nativeElement.querySelector('.empty-desc');
    expect(descEl).toBeTruthy();
    expect(descEl.textContent?.trim()).toBe('Agregá tu primer paciente para comenzar.');
  });

  it('should NOT show the button when actionLabel is empty string', () => {
    component.actionLabel = '';
    fixture.detectChanges();
    const btn: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(btn).toBeNull();
  });

  it('should show button and emit action event when actionLabel is provided and button is clicked', () => {
    component.actionLabel = 'Agregar paciente';
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe('Agregar paciente');

    const spy = spyOn(component.action, 'emit');
    btn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should render the icon emoji', () => {
    component.icon = '🥗';
    fixture.detectChanges();
    const iconEl: HTMLElement = fixture.nativeElement.querySelector('.empty-icon');
    expect(iconEl).toBeTruthy();
    expect(iconEl.textContent?.trim()).toBe('🥗');
  });
});
