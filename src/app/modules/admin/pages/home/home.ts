import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ShopOverviewCard } from '@ui/shop-overview-card/shop-overview-card';
import { ShopOverviewCardData } from '@ui/shop-overview-card/models/shop-overview-card.model';
import { AdminsService } from '../admins/services/admins.service';
import { AdminApiItem, AdminShopApiItem } from '../admins/models/admin.model';
import {
  HOME_METRIC_PENDING_ICON,
  HOME_SHOP_ROUTE_PREFIX,
  HOME_TEXTS,
} from './constants/home.constants';

@Component({
  selector: 'app-home',
  imports: [ShopOverviewCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly adminsService = inject(AdminsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = HOME_TEXTS;
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly cards = signal<ShopOverviewCardData[]>([]);
  protected readonly hasCards = computed(() => this.cards().length > 0);

  constructor() {
    this.loadAdminShops();
  }

  protected onManageStore(shopId: string): void {
    this.router.navigate([HOME_SHOP_ROUTE_PREFIX, shopId]);
  }

  private loadAdminShops(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.cards.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminsService
      .getAdminById(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (admin) => {
          this.cards.set(this.mapAdminShopsToCards(admin.shops));
        },
        error: () => {
          this.hasError.set(true);
          this.cards.set([]);
        },
      });
  }

  private mapAdminShopsToCards(shops: AdminApiItem['shops']): ShopOverviewCardData[] {
    const items = shops ?? [];
    const uniqueShops = new Map<string, ShopOverviewCardData>();

    items.forEach((shop) => {
      const normalizedShop = this.normalizeShop(shop);
      if (!normalizedShop) {
        return;
      }

      uniqueShops.set(normalizedShop.shopId, normalizedShop);
    });

    return Array.from(uniqueShops.values()).sort((left, right) =>
      left.title.localeCompare(right.title),
    );
  }

  private normalizeShop(shop: string | number | AdminShopApiItem): ShopOverviewCardData | null {
    if (typeof shop === 'string' || typeof shop === 'number') {
      const id = String(shop).trim();
      if (!id) {
        return null;
      }

      return this.buildCard(id, this.buildFallbackName(id));
    }

    const id = this.resolveId(shop.id);
    if (!id) {
      return null;
    }

    const name = (shop.name ?? '').trim() || this.buildFallbackName(id);
    return this.buildCard(id, name);
  }

  private buildCard(shopId: string, title: string): ShopOverviewCardData {
    return {
      shopId,
      title,
      actionLabel: HOME_TEXTS.MANAGE_SHOP_LABEL,
      metrics: [
        {
          label: HOME_TEXTS.SALES_METRIC_LABEL,
          value: HOME_TEXTS.METRIC_EMPTY_VALUE,
          helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
          helperIcon: HOME_METRIC_PENDING_ICON,
        },
        {
          label: HOME_TEXTS.STOCK_METRIC_LABEL,
          value: HOME_TEXTS.METRIC_EMPTY_VALUE,
          helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
        },
      ],
    };
  }

  private buildFallbackName(shopId: string): string {
    return `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} ${shopId}`;
  }

  private resolveId(value: string | number | null | undefined): string {
    return String(value ?? '').trim();
  }
}
