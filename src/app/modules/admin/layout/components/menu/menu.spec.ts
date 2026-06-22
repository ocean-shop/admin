import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Menu } from './menu';
import { LayoutService } from '../../services/layout.service';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [LayoutService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
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
});
