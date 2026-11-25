import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import {
  isPageChangeAllowed,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination/pagination.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { isDropdownOptionValue } from '@ui/dropdown/helpers/dropdown-option.helper';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { EmptyState } from '@ui/empty-state/empty-state';
import { FilterActions } from '@ui/filter-actions/filter-actions';
import { FilterBar } from '@ui/filter-bar/filter-bar';
import { FilterDropdown } from '@ui/filter-dropdown/filter-dropdown';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import { SortOrder } from '../../models/sort-order.type';
import {
  PRODUCTS_SECTION_PATH,
  PRODUCTS_UPDATE_PATH,
} from '../products/constants/products.constants';
import { ReviewsList } from './components/reviews-list/reviews-list';
import {
  REVIEW_STATUS_SUCCESS_TITLES,
  REVIEWS_DEFAULT_FILTERS,
  REVIEWS_ICONS,
  REVIEWS_PAGE_SIZE,
  REVIEWS_RATING_OPTIONS,
  REVIEWS_SORT_OPTIONS,
  REVIEWS_STATUS_OPTIONS,
  REVIEWS_TEXTS,
} from './constants/reviews.constants';
import {
  applyReviewStatusChange,
  areReviewFiltersEqual,
  buildReviewFiltersQuery,
  formatReviewsCount,
  mapReview,
} from './helpers/review-mapping/review-mapping.helper';
import { ReviewFilters } from './models/review-filters.model';
import { ReviewListResponse } from './models/review.model';
import { ReviewRatingFilter } from './models/review-rating-filter.type';
import { ReviewStatusFilter } from './models/review-status-filter.type';
import { UpdateReviewStatusVariables } from './models/update-review-status-variables.model';
import { ReviewsService } from './services/reviews/reviews.service';

@Component({
  selector: 'app-reviews',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    FilterBar,
    FilterDropdown,
    FilterActions,
    EmptyState,
    Button,
    ReviewsList,
    Pagination,
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews {
  private readonly reviewsService = inject(ReviewsService);
  private readonly router = inject(Router);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = REVIEWS_TEXTS;
  protected readonly icons = REVIEWS_ICONS;
  protected readonly pageSize = REVIEWS_PAGE_SIZE;
  protected readonly statusOptions = REVIEWS_STATUS_OPTIONS;
  protected readonly ratingOptions = REVIEWS_RATING_OPTIONS;
  protected readonly sortOptions = REVIEWS_SORT_OPTIONS;

  protected readonly shopId = injectRouteParam('shopId');
  /** Filters picked in the bar; they reach the request only after "Apply". */
  protected readonly draftFilters = signal<ReviewFilters>(REVIEWS_DEFAULT_FILTERS);
  protected readonly filters = signal<ReviewFilters>(REVIEWS_DEFAULT_FILTERS);
  protected readonly currentPage = linkedSignal({
    source: () => [this.shopId(), this.filters()],
    computation: () => 1,
  });

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), REVIEWS_TEXTS.PAGE_TITLE),
  );

  protected readonly reviewsQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const filters = this.filters();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.reviews(shopId, page, this.pageSize, filters)
        : SHOP_QUERY_KEYS.disabled('reviews'),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.reviewsService.getReviews({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            ...buildReviewFiltersQuery(filters),
          }),
        ),
    };
  });

  protected readonly updateStatusMutation = injectMutation(() => ({
    mutationFn: ({ id, status }: UpdateReviewStatusVariables) =>
      lastValueFrom(this.reviewsService.updateReviewStatus(id, { status })),
  }));

  protected readonly isLoading = computed(() => this.reviewsQuery.isPending());
  protected readonly hasError = computed(() => this.reviewsQuery.isError());
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFilterDisabled = computed(
    () => !this.isShopContextReady() || this.reviewsQuery.isFetching(),
  );
  protected readonly reviews = computed(() =>
    (this.reviewsQuery.data()?.items ?? []).map(mapReview),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.reviewsQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.reviewsQuery.data()));
  protected readonly countLabel = computed(() => formatReviewsCount(this.totalItems()));
  protected readonly isEmpty = computed(
    () => this.isShopContextReady() && !this.isLoading() && this.reviews().length === 0,
  );
  protected readonly pendingStatusChange = computed(() =>
    this.updateStatusMutation.isPending() ? (this.updateStatusMutation.variables() ?? null) : null,
  );

  protected onStatusSelected(option: DropdownOption): void {
    const value = option.value;
    if (isDropdownOptionValue<ReviewStatusFilter>(value, this.statusOptions)) {
      this.draftFilters.update((filters) => ({ ...filters, status: value }));
    }
  }

  protected onRatingSelected(option: DropdownOption): void {
    const value = option.value;
    if (isDropdownOptionValue<ReviewRatingFilter>(value, this.ratingOptions)) {
      this.draftFilters.update((filters) => ({ ...filters, rating: value }));
    }
  }

  protected onSortSelected(option: DropdownOption): void {
    const value = option.value;
    if (isDropdownOptionValue<SortOrder>(value, this.sortOptions)) {
      this.draftFilters.update((filters) => ({ ...filters, sortOrder: value }));
    }
  }

  protected onApplyFilters(): void {
    this.setFilters(this.draftFilters());
  }

  protected onResetFilters(): void {
    this.draftFilters.set(REVIEWS_DEFAULT_FILTERS);
    this.setFilters(REVIEWS_DEFAULT_FILTERS);
  }

  protected onPageChange(page: number): void {
    if (isPageChangeAllowed(page, this.currentPage(), this.totalPages())) {
      this.currentPage.set(page);
    }
  }

  protected onOpenProduct(productId: string): void {
    const shopId = this.shopId();
    if (shopId) {
      void this.router.navigate([
        APP_ROUTES.ADMIN_SHOP,
        shopId,
        PRODUCTS_SECTION_PATH,
        productId,
        PRODUCTS_UPDATE_PATH,
      ]);
    }
  }

  protected onStatusChange(variables: UpdateReviewStatusVariables): void {
    const shopId = this.shopId();
    if (!shopId || this.updateStatusMutation.isPending()) {
      return;
    }

    const filters = this.filters();
    const listKey = SHOP_QUERY_KEYS.reviews(shopId, this.currentPage(), this.pageSize, filters);

    this.updateStatusMutation.mutate(variables, {
      onSuccess: () => {
        this.queryClient.setQueryData<ReviewListResponse>(listKey, (response) =>
          applyReviewStatusChange(response, variables.id, variables.status, filters.status),
        );
        this.toasterService.success(REVIEW_STATUS_SUCCESS_TITLES[variables.status]);
        void this.queryClient.invalidateQueries({
          queryKey: SHOP_QUERY_KEYS.reviewsScope(shopId),
        });
      },
    });
  }

  private setFilters(next: ReviewFilters): void {
    if (!areReviewFiltersEqual(next, this.filters())) {
      this.filters.set(next);
    }
  }
}
