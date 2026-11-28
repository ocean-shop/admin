import { Component, computed, input, output, signal } from '@angular/core';
import { ShareBar } from '@ui/share-bar/share-bar';
import { Tabs } from '@ui/tabs/tabs';
import {
  PRODUCT_REPORT_ICONS,
  PRODUCT_REPORT_TEXTS,
} from '../../../../constants/product-report.constants';
import {
  buildAbcFilterTabs,
  filterTopProducts,
  isAbcFilter,
} from '../../../../helpers/product-report-mapping/product-report-mapping.helper';
import { formatReportCount } from '../../../../helpers/report-format/report-format.helper';
import { AbcFilter } from '../../../../models/abc-filter.type';
import { TopProductRow } from '../../../../models/product-report-view.model';

/** Products ranked by revenue with an A/B/C filter. */
@Component({
  selector: 'app-top-products-table',
  imports: [Tabs, ShareBar],
  templateUrl: './top-products-table.html',
  styleUrl: './top-products-table.scss',
})
export class TopProductsTable {
  public readonly rows = input.required<TopProductRow[]>();
  public readonly productsSold = input<number>(0);
  public readonly openProduct = output<string>();

  protected readonly textData = PRODUCT_REPORT_TEXTS;
  protected readonly icon = PRODUCT_REPORT_ICONS.TOP;
  protected readonly filter = signal<AbcFilter>('all');

  protected readonly tabs = computed(() => buildAbcFilterTabs(this.rows()));
  protected readonly visibleRows = computed(() => filterTopProducts(this.rows(), this.filter()));
  protected readonly shownLabel = computed(() =>
    [
      this.textData.TOP_SHOWN_PREFIX,
      formatReportCount(this.visibleRows().length),
      this.textData.TOP_SHOWN_JOINER,
      formatReportCount(this.productsSold()),
      this.textData.TOP_SHOWN_SUFFIX,
    ].join(' '),
  );

  protected onFilterChange(value: string): void {
    if (isAbcFilter(value)) {
      this.filter.set(value);
    }
  }

  protected onOpenProduct(productId: string): void {
    if (productId) {
      this.openProduct.emit(productId);
    }
  }
}
