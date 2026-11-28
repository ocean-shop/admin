import { Component, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import { ShareBar } from '@ui/share-bar/share-bar';
import {
  QUICK_ORDER_REPORT_ICONS,
  QUICK_ORDER_REPORT_TEXTS,
} from '../../../../constants/quick-order-report.constants';
import { QuickOrderStatusSplitView } from '../../../../models/quick-order-report-view.model';

/** Quick order requests split by status with their estimated value. */
@Component({
  selector: 'app-quick-order-status-split',
  imports: [SectionCard, ShareBar],
  templateUrl: './quick-order-status-split.html',
  styleUrl: './quick-order-status-split.scss',
})
export class QuickOrderStatusSplit {
  public readonly split = input.required<QuickOrderStatusSplitView>();

  protected readonly textData = QUICK_ORDER_REPORT_TEXTS;
  protected readonly icon = QUICK_ORDER_REPORT_ICONS.STATUS;
}
