import { Component, effect, inject, input, untracked } from '@angular/core';
import { Checkbox } from '@ui/checkbox/checkbox';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductCategoriesToastTexts } from './models/product-categories-toast-texts.model';
import { ProductCategoriesService } from './services/product-categories.service';

@Component({
  selector: 'app-product-form-categories',
  imports: [Checkbox],
  providers: [ProductCategoriesService],
  templateUrl: './product-form-categories.html',
  styleUrl: './product-form-categories.scss',
})
export class ProductFormCategories {
  private readonly categoriesService = inject(ProductCategoriesService);

  readonly texts = input.required<ProductFormTexts>();
  readonly toastTexts = input.required<ProductCategoriesToastTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialSelectedCategoryIds = input<Set<string>>(new Set());

  protected readonly categoryNodes = this.categoriesService.categoryNodes;

  constructor() {
    this.categoriesService.configure(
      {
        getShopId: () => this.shopId(),
        getProductId: () => this.productId(),
        isSidebarEnabled: () => !this.sidebarDisabled(),
      },
      () => this.toastTexts(),
    );

    effect(() => {
      this.shopId();
      untracked(() => this.categoriesService.loadCategories());
    });

    effect(() => {
      const selectedCategoryIds = this.initialSelectedCategoryIds();
      untracked(() => this.categoriesService.setSelectedCategoryIds(selectedCategoryIds));
    });
  }

  protected onCategoryCheckedChange(categoryId: string, checked: boolean): void {
    if (this.sidebarDisabled()) {
      return;
    }

    this.categoriesService.onCategoryToggle({ categoryId, checked });
  }
}
