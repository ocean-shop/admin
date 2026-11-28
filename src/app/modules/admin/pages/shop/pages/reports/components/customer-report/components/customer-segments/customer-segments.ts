import { Component, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import {
  CUSTOMER_REPORT_ICONS,
  CUSTOMER_REPORT_TEXTS,
} from '../../../../constants/customer-report.constants';
import { CustomerSegmentView } from '../../../../models/customer-report-view.model';

/** RFM segments as cards: size, share and a suggested action. */
@Component({
  selector: 'app-customer-segments',
  imports: [SectionCard],
  templateUrl: './customer-segments.html',
  styleUrl: './customer-segments.scss',
})
export class CustomerSegments {
  public readonly segments = input.required<CustomerSegmentView[]>();
  public readonly description = input<string>('');

  protected readonly textData = CUSTOMER_REPORT_TEXTS;
  protected readonly icon = CUSTOMER_REPORT_ICONS.SEGMENTS;
}
