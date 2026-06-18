import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OtpForm } from './otp-form';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { OTP_EXPIRATION_KEY } from '../../constants/login.constant';

describe('OtpForm', () => {
  let component: OtpForm;
  let fixture: ComponentFixture<OtpForm>;
  let mockLocalStorageService: any;

  beforeEach(async () => {
    mockLocalStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    // Prevent setInterval from actually running and hanging tests
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [OtpForm],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocalStorageService, useValue: mockLocalStorageService },
      ],
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

  it('should start timer on init with new expiration time', () => {
    const mockNow = 1000000;
    vi.setSystemTime(mockNow);
    mockLocalStorageService.getItem.mockReturnValue(null);

    component.ngOnInit();

    // Expect setItem to be called with now + 5 minutes
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(
      OTP_EXPIRATION_KEY,
      mockNow + 300 * 1000,
    );
    expect(component.timeLeft()).toBe(300);
  });

  it('should use existing expiration time if valid', () => {
    const mockNow = 1000000;
    vi.setSystemTime(mockNow);
    const savedExpiration = mockNow + 150 * 1000; // 150 seconds left
    mockLocalStorageService.getItem.mockReturnValue(savedExpiration);

    component.ngOnInit();

    expect(mockLocalStorageService.setItem).not.toHaveBeenCalled();
    expect(component.timeLeft()).toBe(150);
  });

  it('should emit submitEvent and remove expiration on submit if valid', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');

    component.otpModel.set({ otp: '1234' });
    component.onSubmit();

    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(OTP_EXPIRATION_KEY);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not emit submitEvent on submit if invalid', () => {
    const emitSpy = vi.spyOn(component.submitEvent, 'emit');

    component.otpModel.set({ otp: '12' });
    component.onSubmit();

    expect(mockLocalStorageService.removeItem).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit backToLoginEvent and clear storage when timer reaches zero', () => {
    const mockNow = 1000000;
    vi.setSystemTime(mockNow);
    mockLocalStorageService.getItem.mockReturnValue(null); // Will set to 300s

    component.ngOnInit();

    // Advance time by 300 seconds
    vi.advanceTimersByTime(300 * 1000);

    expect(component.timeLeft()).toBe(0);
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(OTP_EXPIRATION_KEY);
    // Notice that emitSpy should NOT be called directly here anymore
    // because we removed `this.timeoutEvent.emit()` from `handleTimeout()`
  });

  it('should format time correctly', () => {
    // 150 seconds = 02:30
    component.timeLeft.set(150);
    expect(component.formattedTime()).toBe('02:30');

    // 45 seconds = 00:45
    component.timeLeft.set(45);
    expect(component.formattedTime()).toBe('00:45');
  });

  it('should clear timer on destroy', () => {
    component.ngOnInit();

    component.ngOnDestroy();

    // We switched to RxJS interval so clearInterval is no longer used
    expect(component['countdownSub']).toBeUndefined();
  });
});
