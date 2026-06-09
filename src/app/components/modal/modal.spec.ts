import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModalComponent } from './modal';

describe('AppModalComponent', () => {
  let component: AppModalComponent;
  let fixture: ComponentFixture<AppModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not render the overlay when visible is false', () => {
    component.visible = false;
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    expect(overlay).toBeNull();
  });

  it('should render the overlay when visible is true', () => {
    component.visible = true;
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    expect(overlay).not.toBeNull();
  });

  it('should show title and message correctly', () => {
    component.visible = true;
    component.title = 'Test Title';
    component.message = 'Test message body';
    fixture.detectChanges();
    const titleEl = fixture.nativeElement.querySelector('.modal-title');
    const bodyEl = fixture.nativeElement.querySelector('.modal-body');
    expect(titleEl.textContent).toContain('Test Title');
    expect(bodyEl.textContent).toContain('Test message body');
  });

  it('should emit confirmed when confirm button is clicked', () => {
    component.visible = true;
    fixture.detectChanges();
    const confirmedSpy = spyOn(component.confirmed, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.modal-actions .btn');
    // Second button is the confirm button
    buttons[1].click();
    expect(confirmedSpy).toHaveBeenCalled();
  });

  it('should emit cancelled when cancel button is clicked', () => {
    component.visible = true;
    fixture.detectChanges();
    const cancelledSpy = spyOn(component.cancelled, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.modal-actions .btn');
    // First button is the cancel button
    buttons[0].click();
    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('should apply btn-danger class when type is danger', () => {
    component.visible = true;
    component.type = 'danger';
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.modal-actions .btn');
    const confirmBtn = buttons[1];
    expect(confirmBtn.classList).toContain('btn-danger');
    expect(confirmBtn.classList).not.toContain('btn-primary');
  });

  it('should apply btn-primary class when type is confirm', () => {
    component.visible = true;
    component.type = 'confirm';
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.modal-actions .btn');
    const confirmBtn = buttons[1];
    expect(confirmBtn.classList).toContain('btn-primary');
    expect(confirmBtn.classList).not.toContain('btn-danger');
  });
});
