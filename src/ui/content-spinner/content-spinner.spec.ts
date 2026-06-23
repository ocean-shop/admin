import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContentSpinner } from './content-spinner';

describe('ContentSpinner', () => {
  let fixture: ComponentFixture<ContentSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentSpinner],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentSpinner);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render overlay and spinner', () => {
    const overlay = fixture.debugElement.query(By.css('.content-spinner-overlay'));
    const ring = fixture.debugElement.query(By.css('.content-spinner-ring'));

    expect(overlay).toBeTruthy();
    expect(ring).toBeTruthy();
  });

  it('should expose loading status for assistive tech', () => {
    const overlay = fixture.debugElement.query(By.css('.content-spinner-overlay'))
      .nativeElement as HTMLElement;

    expect(overlay.getAttribute('role')).toBe('status');
    expect(overlay.getAttribute('aria-label')).toBe('Loading');
  });
});
