import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_REPORT_TEXTS } from '../../../../constants/product-report.constants';
import { AbcClassView } from '../../../../models/product-report-view.model';
import { AbcSummary } from './abc-summary';

describe('AbcSummary', () => {
  let fixture: ComponentFixture<AbcSummary>;
  let element: HTMLElement;

  const buildClass = (abcClass: 'A' | 'B' | 'C', tone: AbcClassView['tone']): AbcClassView => ({
    abcClass,
    title: `Клас ${abcClass}`,
    tone,
    revenue: '1 000 ₴',
    shareLabel: '10% виручки',
    countLabel: '1 товар',
    metaLabel: '10% виручки · 1 товар',
    productsCount: 1,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbcSummary],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AbcSummary);
    fixture.componentRef.setInput('classes', [
      buildClass('A', 'primary'),
      buildClass('B', 'secondary'),
      buildClass('C', 'muted'),
    ]);
    fixture.componentRef.setInput('segments', [{ value: 0.8, tone: 'primary', label: 'A · 80%' }]);
    fixture.componentRef.setInput('ariaLabel', 'Частка виручки: A 80%');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders title, cards and the stacked bar', () => {
    const keys = Array.from(element.querySelectorAll('.abc-class-key'));

    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      PRODUCT_REPORT_TEXTS.ABC_TITLE,
    );
    expect(keys.map((key) => key.textContent)).toEqual(['A', 'B', 'C']);
    expect(keys[0].classList).toContain('abc-class-key-primary');
    expect(keys[1].classList).toContain('abc-class-key-secondary');
    expect(element.querySelector('.abc-class-meta')?.textContent).toContain(
      '10% виручки · 1 товар',
    );
    expect(element.querySelector('.share-bar')?.getAttribute('aria-label')).toBe(
      'Частка виручки: A 80%',
    );
  });
});
