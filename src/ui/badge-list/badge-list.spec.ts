import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeList } from './badge-list';

describe('BadgeList', () => {
  let fixture: ComponentFixture<BadgeList>;
  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeList);
    fixture.componentRef.setInput('labels', ['5G', 'Android', '5G']);
    await fixture.whenStable();
  });

  it('renders a plain badge per label with the primary tone by default', () => {
    const badges = element().querySelectorAll('.badge');

    expect(badges).toHaveLength(3);
    expect(badges[1].textContent?.trim()).toBe('Android');
    expect(badges[0].classList).toContain('badge-primary');
    expect(badges[0].classList).toContain('badge-plain');
  });

  it('applies a custom tone', async () => {
    fixture.componentRef.setInput('tone', 'info');
    await fixture.whenStable();

    expect(element().querySelector('.badge')?.classList).toContain('badge-info');
  });

  it('shows the empty text when there are no labels', async () => {
    fixture.componentRef.setInput('labels', []);
    fixture.componentRef.setInput('emptyText', 'Немає тегів');
    await fixture.whenStable();

    expect(element().querySelector('.badge-list')).toBeNull();
    expect(element().querySelector('.badge-list-empty')?.textContent).toContain('Немає тегів');
  });

  it('renders nothing when empty and no empty text is given', async () => {
    fixture.componentRef.setInput('labels', []);
    await fixture.whenStable();

    expect(element().textContent?.trim()).toBe('');
  });
});
