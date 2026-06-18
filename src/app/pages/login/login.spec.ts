import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Login } from './login';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { ToasterService } from '@ui/toaster/toaster.service';
import { LoginService } from './services/login.service';
import { LoginView } from './models/login.enum';
import { VIEW_STORAGE_KEY, OTP_EXPIRATION_KEY } from './constants/login.constant';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockLocalStorageService: any;
  let mockToasterService: any;
  let mockLoginService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockLocalStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    mockToasterService = {
      success: vi.fn(),
    };

    mockLoginService = {
      requestOtp: vi.fn().mockReturnValue(of({})),
      verifyOtp: vi.fn().mockReturnValue(of({})),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: LoginService, useValue: mockLoginService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restore view from local storage on init', () => {
    mockLocalStorageService.getItem.mockReturnValue(LoginView.Otp);
    component.ngOnInit();
    expect(mockLocalStorageService.getItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY);
    expect(component.currentView()).toBe(LoginView.Otp);
  });

  it('should update selected language', () => {
    const mockOption = { id: 'fr', label: 'French' };
    component.onLanguageSelected(mockOption);
    expect(component.selectedLanguage()).toEqual(mockOption);
  });

  it('should handle submit', () => {
    component.onSubmit('test@example.com');
    expect(mockLoginService.requestOtp).toHaveBeenCalledWith('test@example.com');
    expect(mockToasterService.success).toHaveBeenCalledWith(
      'OTP Sent',
      'Please check your email or phone for the OTP.',
    );
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(OTP_EXPIRATION_KEY);
    expect(component.currentView()).toBe(LoginView.Otp);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY, LoginView.Otp);
  });

  it('should handle otp submit', () => {
    component.identity.set('test@example.com');
    component.onOtpSubmit('1234');
    expect(mockLoginService.verifyOtp).toHaveBeenCalledWith('test@example.com', '1234');
    expect(mockToasterService.success).toHaveBeenCalledWith(
      'Success',
      'OTP verified successfully.',
    );
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY);
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(OTP_EXPIRATION_KEY);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should handle back to login', () => {
    component.onBackToLogin();
    expect(component.currentView()).toBe(LoginView.Login);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY, LoginView.Login);
  });
});
