import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { REPORTS_TEXTS } from '../../constants/reports.constants';
import { buildPresetPeriod } from '../../helpers/report-period/report-period.helper';
import { ReportPeriodSelection } from '../../models/report-period-selection.model';
import { ReportPeriodFilter } from './report-period-filter';

describe('ReportPeriodFilter', () => {
  let fixture: ComponentFixture<ReportPeriodFilter>;
  let element: HTMLElement;
  let emitted: ReportPeriodSelection[];

  const dateInput = (id: string): HTMLInputElement =>
    element.querySelector(`input#${id}`) as HTMLInputElement;

  const typeDate = async (id: string, value: string): Promise<void> => {
    const input = dateInput(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPeriodFilter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportPeriodFilter);
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    fixture.componentRef.setInput('preset', 'thisMonth');
    emitted = [];
    fixture.componentInstance.selectionChange.subscribe((selection) => emitted.push(selection));
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('shows the current dates and preset', () => {
    expect(dateInput('report-period-from').value).toBe('2026-11-01');
    expect(dateInput('report-period-to').value).toBe('2026-11-27');
    expect((element.querySelector('input[type="radio"]:checked') as HTMLInputElement).value).toBe(
      'thisMonth',
    );
  });

  it('emits a custom period without preset', async () => {
    await typeDate('report-period-from', '2026-11-10');
    await typeDate('report-period-to', '2026-11-20');

    expect(emitted).toEqual([
      { period: { from: '2026-11-10', to: '2026-11-27' }, preset: null },
      { period: { from: '2026-11-01', to: '2026-11-20' }, preset: null },
    ]);
  });

  it('shows a warning and does not emit an invalid period', async () => {
    await typeDate('report-period-from', '2026-12-01');

    expect(emitted).toEqual([]);
    expect(element.textContent).toContain(REPORTS_TEXTS.PERIOD_INVALID_MESSAGE);

    await typeDate('report-period-from', '2026-11-05');
    expect(element.textContent).not.toContain(REPORTS_TEXTS.PERIOD_INVALID_MESSAGE);
  });

  it('emits the preset period', async () => {
    const radio = element.querySelector('input[value="last7Days"]') as HTMLInputElement;
    radio.click();
    await fixture.whenStable();

    expect(emitted).toEqual([{ period: buildPresetPeriod('last7Days'), preset: 'last7Days' }]);
  });

  it('ignores unknown preset values', () => {
    (fixture.componentInstance as any).onPresetChange('yearly');

    expect(emitted).toEqual([]);
  });
});
