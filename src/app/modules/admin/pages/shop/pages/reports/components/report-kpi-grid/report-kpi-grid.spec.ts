import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportKpi } from '../../models/report-kpi.model';
import { ReportKpiGrid } from './report-kpi-grid';

describe('ReportKpiGrid', () => {
  let fixture: ComponentFixture<ReportKpiGrid>;
  let element: HTMLElement;

  const kpis: ReportKpi[] = [
    {
      id: 'netSales',
      label: 'Чиста виручка',
      value: '219 600 ₴',
      hint: 'Оплачені',
      change: { label: '+2,7%', direction: 'up', tone: 'success' },
      previous: 'було 213 800 ₴',
    },
    { id: 'aov', label: 'Середній чек', value: '1 284 ₴', hint: '', change: null, previous: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportKpiGrid],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportKpiGrid);
    fixture.componentRef.setInput('kpis', kpis);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a tile per KPI without comparison by default', () => {
    expect(
      Array.from(element.querySelectorAll('.stat-card-value')).map((node) => node.textContent),
    ).toEqual(['219 600 ₴', '1 284 ₴']);
    expect(element.querySelector('.stat-card-helper')?.textContent).toContain('Оплачені');
    expect(element.querySelector('.stat-card-change')).toBeNull();
  });

  it('shows changes when comparing', async () => {
    fixture.componentRef.setInput('compare', true);
    await fixture.whenStable();

    expect(element.querySelectorAll('.stat-card-change')).toHaveLength(1);
    expect(element.querySelector('.stat-card-previous')?.textContent).toContain('було 213 800 ₴');
  });
});
