import { Component, input } from '@angular/core';
import { StatCard } from '@ui/stat-card/stat-card';
import { ReportKpi } from '../../models/report-kpi.model';

/** Responsive grid of report metric tiles. */
@Component({
  selector: 'app-report-kpi-grid',
  imports: [StatCard],
  templateUrl: './report-kpi-grid.html',
  styleUrl: './report-kpi-grid.scss',
})
export class ReportKpiGrid {
  public readonly kpis = input.required<ReportKpi[]>();
  /** Shows changes and previous values. */
  public readonly compare = input<boolean>(false);
}
