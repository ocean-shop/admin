import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submitEvent on submit if form is valid', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');
    component.loginModel.set({ identity: 'test@example.com' });
    component.onSubmit();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not emit submitEvent on submit if form is invalid', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');
    component.loginModel.set({ identity: 'invalid-email' });
    component.onSubmit();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
