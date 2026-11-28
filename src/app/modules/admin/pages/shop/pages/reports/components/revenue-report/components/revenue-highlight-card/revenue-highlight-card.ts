import { Component, input, output } from '@angular/core';
import { ChangeBadge } from '@ui/change-badge/change-badge';
import { REVENUE_REPORT_ICONS } from '../../../../constants/revenue-report.constants';
import { RevenueHighlight } from '../../../../models/revenue-report-view.model';

/** Callout with a big amount, an explanation and a link to the related orders. */
@Component({
  selector: 'app-revenue-highlight-card',
  imports: [ChangeBadge],
  templateUrl: './revenue-highlight-card.html',
  styleUrl: './revenue-highlight-card.scss',
})
export class RevenueHighlightCard {
  public readonly highlight = input.required<RevenueHighlight>();
  /** Shows the change vs the previous period. */
  public readonly compare = input<boolean>(true);
  public readonly linkClick = output<void>();

  protected readonly linkIcon = REVENUE_REPORT_ICONS.LINK;
}
