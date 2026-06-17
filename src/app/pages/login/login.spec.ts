import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { ToasterService } from '@ui/toaster/toaster.service';
import { LoginView } from './models/login.enum';
import { VIEW_STORAGE_KEY } from './constants/login.constant';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockLocalStorageService: any;
  let mockToasterService: any;

  beforeEach(async () => {
    mockLocalStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    mockToasterService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: ToasterService, useValue: mockToasterService },
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
    component.onSubmit();
    expect(mockToasterService.success).toHaveBeenCalledWith(
      'Login Attempt',
      'Sign in process initiated successfully.',
    );
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith('otp_expiration_time');
    expect(component.currentView()).toBe(LoginView.Otp);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY, LoginView.Otp);
  });

  it('should handle back to login', () => {
    component.onBackToLogin();
    expect(component.currentView()).toBe(LoginView.Login);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY, LoginView.Login);
  });
});
