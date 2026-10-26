import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OtpForm } from './otp-form';

describe('OtpForm', () => {
  let component: any;
  let fixture: ComponentFixture<OtpForm>;
  const now = 1_000_000;

  const query = (selector: string): HTMLElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector(selector);

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    await TestBed.configureTestingModule({
      imports: [OtpForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpForm);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('counts down to the given expiration', () => {
    fixture.componentRef.setInput('expiresAt', now + 150 * 1000);
    expect(component.timeLeft()).toBe(150);
    expect(component.formattedTime()).toBe('02:30');

    vi.advanceTimersByTime(105 * 1000);

    expect(component.timeLeft()).toBe(45);
    expect(component.formattedTime()).toBe('00:45');
  });

  it('never goes below zero', () => {
    fixture.componentRef.setInput('expiresAt', now - 10_000);

    expect(component.timeLeft()).toBe(0);
    expect(component.formattedTime()).toBe('00:00');
  });

  it('shows submit while the code is valid and resend after it expires', () => {
    fixture.componentRef.setInput('expiresAt', now + 2000);
    fixture.detectChanges();
    expect(query('#otp-resend')).toBeNull();

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();

    expect(query('#otp-resend')).toBeTruthy();
  });

  it('emits resendEvent when the resend button is clicked', () => {
    const emitSpy = vi.spyOn(component.resendEvent, 'emit');
    fixture.detectChanges();

    (query('#otp-resend button') as HTMLButtonElement).click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('does not emit resendEvent while loading', () => {
    const emitSpy = vi.spyOn(component.resendEvent, 'emit');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    expect((query('#otp-resend button') as HTMLButtonElement).disabled).toBe(true);
    component.onResend();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('emits submitEvent on submit if valid', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');

    component.otpModel.set({ otp: '1234' });
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith('1234');
  });

  it('does not emit submitEvent if invalid or loading', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');

    component.otpModel.set({ otp: '12' });
    component.onSubmit();

    component.otpModel.set({ otp: '1234' });
    fixture.componentRef.setInput('isLoading', true);
    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('emits backToLoginEvent', () => {
    const emitSpy = vi.spyOn(component.backToLoginEvent, 'emit');

    component.onBackToLogin();

    expect(emitSpy).toHaveBeenCalled();
  });
});
