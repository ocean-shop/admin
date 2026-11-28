import { Component, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import { ShareBar } from '@ui/share-bar/share-bar';
import {
  CUSTOMER_REPORT_ICONS,
  CUSTOMER_REPORT_TEXTS,
} from '../../../../constants/customer-report.constants';
import { CustomerSplitView } from '../../../../models/customer-report-view.model';

/** Period revenue split between new and returning customers. */
@Component({
  selector: 'app-new-returning-split',
  imports: [SectionCard, ShareBar],
  templateUrl: './new-returning-split.html',
  styleUrl: './new-returning-split.scss',
})
export class NewReturningSplit {
  public readonly split = input.required<CustomerSplitView>();

  protected readonly textData = CUSTOMER_REPORT_TEXTS;
  protected readonly icon = CUSTOMER_REPORT_ICONS.SPLIT;
}
