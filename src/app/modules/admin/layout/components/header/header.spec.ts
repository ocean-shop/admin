import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { LayoutService } from '../../services/layout.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [LayoutService],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(LayoutService);
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
});
