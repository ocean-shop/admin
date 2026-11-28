import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { REVENUE_REPORT_TEXTS } from '../../../../constants/revenue-report.constants';
import { RevenueHighlight } from '../../../../models/revenue-report-view.model';
import { RevenueHighlightCard } from './revenue-highlight-card';

describe('RevenueHighlightCard', () => {
  let fixture: ComponentFixture<RevenueHighlightCard>;
  let element: HTMLElement;

  const highlight: RevenueHighlight = {
    id: 'codInTransit',
    icon: 'local_shipping',
    tone: 'warning',
    title: REVENUE_REPORT_TEXTS.COD_TITLE,
    value: '38 450 ₴',
    description: REVENUE_REPORT_TEXTS.COD_DESCRIPTION,
    change: { label: '+28,6%', direction: 'up', tone: 'danger' },
    previous: 'було 29 900 ₴',
    linkLabel: REVENUE_REPORT_TEXTS.COD_LINK,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueHighlightCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueHighlightCard);
    fixture.componentRef.setInput('highlight', highlight);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the highlight with its tone and change', () => {
    expect(element.querySelector('.highlight-title')?.textContent).toContain(
      REVENUE_REPORT_TEXTS.COD_TITLE,
    );
    expect(element.querySelector('.highlight-value')?.textContent).toContain('38 450 ₴');
    expect(element.querySelector('.highlight-icon')?.classList).toContain('highlight-icon-warning');
    expect(element.querySelector('app-change-badge')?.textContent).toContain('+28,6%');
    expect(element.querySelector('.highlight-previous')?.textContent).toContain('було 29 900 ₴');
  });

  it('hides the change when comparison is off or missing', async () => {
    fixture.componentRef.setInput('compare', false);
    await fixture.whenStable();
    expect(element.querySelector('.highlight-change')).toBeNull();

    fixture.componentRef.setInput('compare', true);
    fixture.componentRef.setInput('highlight', { ...highlight, change: null, tone: 'danger' });
    await fixture.whenStable();
    expect(element.querySelector('.highlight-change')).toBeNull();
    expect(element.querySelector('.highlight-icon')?.classList).toContain('highlight-icon-danger');
  });

  it('emits on link click', () => {
    const clicks = vi.fn();
    fixture.componentInstance.linkClick.subscribe(clicks);

    (element.querySelector('.highlight-link') as HTMLButtonElement).click();

    expect(clicks).toHaveBeenCalledTimes(1);
  });
});
