import { Component, effect, inject, input, untracked } from '@angular/core';
import { Checkbox } from '@ui/checkbox/checkbox';
import {
  PRODUCT_FORM_CATEGORIES_ICON,
  PRODUCT_FORM_CATEGORY_CHECKBOX_ID_PREFIX,
} from '../../constants/product-form.constants';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { ProductCategoriesService } from './services/product-categories/product-categories.service';

@Component({
  selector: 'app-product-form-categories',
  imports: [ProductFormCard, Checkbox],
  providers: [ProductCategoriesService],
  templateUrl: './product-form-categories.html',
  styleUrl: './product-form-categories.scss',
})
export class ProductFormCategories {
  private readonly categoriesService = inject(ProductCategoriesService);

  readonly texts = input.required<ProductFormTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialSelectedCategoryIds = input<Set<string>>(new Set());

  protected readonly icon = PRODUCT_FORM_CATEGORIES_ICON;
  protected readonly checkboxIdPrefix = PRODUCT_FORM_CATEGORY_CHECKBOX_ID_PREFIX;
  protected readonly categoryNodes = this.categoriesService.categoryNodes;

  constructor() {
    this.categoriesService.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.productId(),
      isSidebarEnabled: () => !this.sidebarDisabled(),
    });

    // Reloads the category tree when the shop changes.
    effect(() => {
      this.shopId();
      untracked(() => this.categoriesService.loadCategories());
    });

    // Seeds the selection whenever the page loads a (new) product.
    effect(() => {
      const selectedCategoryIds = this.initialSelectedCategoryIds();
      untracked(() => this.categoriesService.setSelectedCategoryIds(selectedCategoryIds));
    });
  }

  protected onCategoryCheckedChange(categoryId: string, checked: boolean): void {
    if (!this.sidebarDisabled()) {
      this.categoriesService.onCategoryToggle({ categoryId, checked });
    }
  }
}
