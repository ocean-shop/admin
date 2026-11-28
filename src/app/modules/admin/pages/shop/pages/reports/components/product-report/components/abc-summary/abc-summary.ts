import { Component, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import { ShareBar } from '@ui/share-bar/share-bar';
import { ShareBarSegment } from '@ui/share-bar/models/share-bar-segment.model';
import {
  PRODUCT_REPORT_ICONS,
  PRODUCT_REPORT_TEXTS,
} from '../../../../constants/product-report.constants';
import { AbcClassView } from '../../../../models/product-report-view.model';

/** A/B/C cards + stacked revenue share bar. */
@Component({
  selector: 'app-abc-summary',
  imports: [SectionCard, ShareBar],
  templateUrl: './abc-summary.html',
  styleUrl: './abc-summary.scss',
})
export class AbcSummary {
  public readonly classes = input.required<AbcClassView[]>();
  public readonly segments = input.required<ShareBarSegment[]>();
  public readonly ariaLabel = input<string>('');

  protected readonly textData = PRODUCT_REPORT_TEXTS;
  protected readonly icon = PRODUCT_REPORT_ICONS.ABC;
}
