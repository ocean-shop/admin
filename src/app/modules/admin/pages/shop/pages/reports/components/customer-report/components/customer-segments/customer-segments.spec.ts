import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CUSTOMER_REPORT_TEXTS,
  CUSTOMER_SEGMENT_META,
} from '../../../../constants/customer-report.constants';
import { CustomerSegmentView } from '../../../../models/customer-report-view.model';
import { CustomerSegments } from './customer-segments';

describe('CustomerSegments', () => {
  let fixture: ComponentFixture<CustomerSegments>;
  let element: HTMLElement;

  const segments: CustomerSegmentView[] = (
    ['champions', 'loyal', 'new', 'atRisk', 'lost'] as const
  ).map((segment) => ({
    segment,
    ...CUSTOMER_SEGMENT_META[segment],
    countLabel: '10',
    detailsLabel: '5% клієнтів',
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSegments],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerSegments);
    fixture.componentRef.setInput('segments', segments);
    fixture.componentRef.setInput('description', '640 клієнтів');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a card per segment with tone classes', () => {
    const icons = Array.from(element.querySelectorAll('.segment-icon'));

    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      CUSTOMER_REPORT_TEXTS.SEGMENTS_TITLE,
    );
    expect(element.querySelector('.section-card-description')?.textContent).toContain(
      '640 клієнтів',
    );
    expect(
      Array.from(element.querySelectorAll('.segment-title')).map((node) => node.textContent),
    ).toEqual(segments.map((segment) => segment.title));
    expect(icons[0].classList).toContain('segment-icon-primary');
    expect(icons[1].classList).toContain('segment-icon-secondary');
    expect(icons[2].className).toBe('segment-icon');
    expect(icons[3].classList).toContain('segment-icon-warning');
    expect(icons[4].classList).toContain('segment-icon-muted');
  });
});
