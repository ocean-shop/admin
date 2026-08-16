import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-shop',
  imports: [RouterLink],
  templateUrl: './shop-detail.html',
  styleUrl: './shop-detail.scss',
})
export class ShopDetail {
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly shopId = toSignal(
    this.activatedRoute.paramMap.pipe(map((params) => params.get('shopId') ?? '')),
    { initialValue: '' },
  );
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
