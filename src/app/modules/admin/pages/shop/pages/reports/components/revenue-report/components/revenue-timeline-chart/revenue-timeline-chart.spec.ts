import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Highcharts from 'highcharts';
import { REVENUE_REPORT_TEXTS } from '../../../../constants/revenue-report.constants';
import { RevenueChartData } from '../../../../models/revenue-report-view.model';
import { RevenueTimelineChart } from './revenue-timeline-chart';

describe('RevenueTimelineChart', () => {
  let fixture: ComponentFixture<RevenueTimelineChart>;
  let element: HTMLElement;
  let chartMock: { update: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> };

  const data: RevenueChartData = {
    categories: ['01.11', '02.11'],
    netSales: [100, 200],
    paidRevenue: [50, 200],
  };
  const empty: RevenueChartData = { categories: [], netSales: [], paidRevenue: [] };

  const create = async (chartData: RevenueChartData): Promise<void> => {
    fixture = TestBed.createComponent(RevenueTimelineChart);
    fixture.componentRef.setInput('data', chartData);
    fixture.componentRef.setInput('title', 'Чиста виручка по днях');
    fixture.componentRef.setInput('description', 'Разом 300 ₴');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    chartMock = { update: vi.fn(), destroy: vi.fn() };
    vi.spyOn(Highcharts, 'chart').mockReturnValue(chartMock as unknown as Highcharts.Chart);

    await TestBed.configureTestingModule({
      imports: [RevenueTimelineChart],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the heading and creates the chart', async () => {
    await create(data);

    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      'Чиста виручка по днях',
    );
    expect(element.querySelector('.section-card-description')?.textContent).toContain(
      'Разом 300 ₴',
    );
    expect(Highcharts.chart).toHaveBeenCalledTimes(1);
  });

  it('updates the existing chart when data changes', async () => {
    await create(data);

    fixture.componentRef.setInput('data', { ...data, netSales: [1, 2] });
    await fixture.whenStable();

    expect(Highcharts.chart).toHaveBeenCalledTimes(1);
    expect(chartMock.update).toHaveBeenCalled();
  });

  it('shows the empty state and destroys the chart when data disappears', async () => {
    await create(data);

    fixture.componentRef.setInput('data', empty);
    await fixture.whenStable();

    expect(element.textContent).toContain(REVENUE_REPORT_TEXTS.CHART_EMPTY);
    expect(chartMock.destroy).toHaveBeenCalled();
  });

  it('does not create a chart without data', async () => {
    await create(empty);

    expect(Highcharts.chart).not.toHaveBeenCalled();
  });

  it('destroys the chart on destroy', async () => {
    await create(data);

    fixture.destroy();

    expect(chartMock.destroy).toHaveBeenCalled();
  });
});
