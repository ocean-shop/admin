import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { buildShopBreadcrumb } from './constants/shop-breadcrumbs.constants';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, Breadcrumbs],
  templateUrl: './shop-detail.html',
  styleUrl: './shop-detail.scss',
})
export class ShopDetail {
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly shopId = toSignal(
    this.activatedRoute.paramMap.pipe(map((params) => params.get('shopId') ?? '')),
    { initialValue: '' },
  );
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
  ]);
  protected readonly categoriesRoute = computed(() => [
    '/admin/shop',
    this.shopId() || ':shopId',
    'categories',
  ]);
  protected readonly tagsRoute = computed(() => [
    '/admin/shop',
    this.shopId() || ':shopId',
    'tags',
  ]);
  protected readonly attributesRoute = computed(() => [
    '/admin/shop',
    this.shopId() || ':shopId',
    'attributes',
  ]);
  protected readonly productsRoute = computed(() => [
    '/admin/shop',
    this.shopId() || ':shopId',
    'products',
  ]);
  protected readonly ordersRoute = computed(() => [
    '/admin/shop',
    this.shopId() || ':shopId',
    'orders',
  ]);
}
