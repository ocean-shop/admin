import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { Header } from './header';
import { LayoutService } from '../../services/layout.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let layoutService: LayoutService;
  let authService: AuthService;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [LayoutService, { provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should logout and navigate to login when logout item is selected', () => {
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
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(fixture.nativeElement.querySelector('app-simple-menu')).toBeNull();
  });
});
