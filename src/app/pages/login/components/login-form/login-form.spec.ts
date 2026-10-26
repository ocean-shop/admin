import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let component: any;
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideZonelessChangeDetection()],
    });

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each(['test@example.com', '+380991234567', '380991234567', '0991234567'])(
    'emits submitEvent for valid identity %s',
    (identity) => {
      const emitSpy = vi.spyOn(component.submitEvent, 'emit');
      component.loginModel.set({ identity });
      component.onSubmit();
      expect(emitSpy).toHaveBeenCalledWith(identity);
    },
  );

  it.each(['invalid-email', '1234567890', '+1555000111', '099123456'])(
    'does not emit submitEvent for invalid identity %s',
    (identity) => {
      const emitSpy = vi.spyOn(component.submitEvent, 'emit');
      component.loginModel.set({ identity });
      component.onSubmit();
      expect(emitSpy).not.toHaveBeenCalled();
    },
  );

  it('does not emit submitEvent while loading', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');
    fixture.componentRef.setInput('isLoading', true);
    component.loginModel.set({ identity: 'test@example.com' });
    component.onSubmit();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
