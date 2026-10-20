import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotPermission } from './not-permission';

describe('NotPermission', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotPermission],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders 403 status', async () => {
    const fixture = TestBed.createComponent(NotPermission);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('403');
  });
});
