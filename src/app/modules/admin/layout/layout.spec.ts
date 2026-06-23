import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Layout } from './layout';
import { LayoutService } from './services/layout.service';
import { provideRouter } from '@angular/router';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [LayoutService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change sidebar state based on window resize', () => {
    const setSidebarStateSpy = vi.spyOn(layoutService, 'setSidebarState');

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    window.dispatchEvent(new Event('resize'));

    expect(setSidebarStateSpy).toHaveBeenCalledWith(false);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    window.dispatchEvent(new Event('resize'));

    expect(setSidebarStateSpy).toHaveBeenCalledWith(true);
  });
});
