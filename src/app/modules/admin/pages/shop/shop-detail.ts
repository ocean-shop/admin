import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { NavTile } from '@ui/nav-tile/nav-tile';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { ShopStatistics } from './components/shop-statistics/shop-statistics';
import { buildShopBreadcrumb } from './helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import {
  SHOP_DETAIL_ROUTE_PREFIX,
  SHOP_DETAIL_SECTIONS,
  SHOP_DETAIL_SHOP_ID_PLACEHOLDER,
  SHOP_DETAIL_TEXTS,
} from './constants/shop-detail.constants';
import { ShopDetailSectionLink } from './models/shop-detail-section.model';

@Component({
  selector: 'app-shop',
  imports: [Breadcrumbs, ShopStatistics, PageLayout, PageHeader, NavTile],
  templateUrl: './shop-detail.html',
  styleUrl: './shop-detail.scss',
})
export class ShopDetail {
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly textData = SHOP_DETAIL_TEXTS;

  protected readonly shopId = toSignal(
    this.activatedRoute.paramMap.pipe(map((params) => params.get('shopId') ?? '')),
    { initialValue: '' },
  );
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
  ]);
  protected readonly sections = computed<ShopDetailSectionLink[]>(() => {
    const shopRouteId = this.shopId() || SHOP_DETAIL_SHOP_ID_PLACEHOLDER;

    return SHOP_DETAIL_SECTIONS.map((section) => ({
      ...section,
      route: [SHOP_DETAIL_ROUTE_PREFIX, shopRouteId, section.segment],
    }));
  });
}
