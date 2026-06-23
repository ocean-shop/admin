import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { Menu } from './menu';
import { LayoutService } from '../../services/layout.service';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let layoutService: LayoutService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [LayoutService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect sidebar state from layoutService', () => {
    layoutService.setSidebarState(true);
    fixture.detectChanges();

    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside.classList.contains('menu-open')).toBeTruthy();
    expect(aside.classList.contains('menu-closed')).toBeFalsy();

    layoutService.setSidebarState(false);
    fixture.detectChanges();

    expect(aside.classList.contains('menu-open')).toBeFalsy();
    expect(aside.classList.contains('menu-closed')).toBeTruthy();
  });

  it('should logout and navigate to login when footer logout button is clicked', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    const logoutButton = fixture.nativeElement.querySelector(
      '.footer-btn-danger',
    ) as HTMLButtonElement;
    logoutButton.click();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
