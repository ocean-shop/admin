import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { AuthService } from '@core/services/auth/auth.service';
import { HEADER_TEXTS } from '../../constants/header.constants';
import { Header } from './header';
import { LayoutService } from '../../services/layout/layout.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let layoutService: LayoutService;
  let authService: AuthService;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        LayoutService,
        { provide: AuthService, useValue: { logout: vi.fn() } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the title as a link to the admin home', () => {
    const link = fixture.nativeElement.querySelector('.header-title-link') as HTMLAnchorElement;

    expect(link.textContent?.trim()).toBe(HEADER_TEXTS.TITLE);
    expect(link.getAttribute('href')).toBe(APP_ROUTES.ADMIN);
  });

  it('should toggle sidebar on menu button click', () => {
    const toggleSpy = vi.spyOn(layoutService, 'toggleSidebar');
    const button = fixture.nativeElement.querySelector('#menu-toggle');
    button.click();
    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should toggle account menu on account button click', () => {
    const button = fixture.nativeElement.querySelector('#account-toggle');

    expect(fixture.nativeElement.querySelector('app-simple-menu')).toBeNull();

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-simple-menu')).toBeTruthy();

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-simple-menu')).toBeNull();
  });

  it('should delegate logout (including navigation) to AuthService', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const button = fixture.nativeElement.querySelector('#account-toggle');

    button.click();
    fixture.detectChanges();

    const logoutLink = fixture.nativeElement.querySelector(
      '.simple-menu-item-danger',
    ) as HTMLElement;
    logoutLink.click();
    fixture.detectChanges();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('app-simple-menu')).toBeNull();
  });
});
