import { Component, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import { ShareBar } from '@ui/share-bar/share-bar';
import { REVENUE_REPORT_TEXTS } from '../../../../constants/revenue-report.constants';
import { RevenueBreakdown as RevenueBreakdownData } from '../../../../models/revenue-report-view.model';

/** Net sales split by payment or shipping method. */
@Component({
  selector: 'app-revenue-breakdown',
  imports: [SectionCard, ShareBar],
  templateUrl: './revenue-breakdown.html',
  styleUrl: './revenue-breakdown.scss',
})
export class RevenueBreakdown {
  public readonly breakdown = input.required<RevenueBreakdownData>();

  protected readonly textData = REVENUE_REPORT_TEXTS;
}
