import { Component, input, output } from '@angular/core';
import { Checkbox } from '@ui/checkbox/checkbox';
import { ProductFormCategoryNode } from '../../models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../../models/product-form-category-toggle-event.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';

@Component({
  selector: 'app-product-form-categories',
  imports: [Checkbox],
  templateUrl: './product-form-categories.html',
  styleUrl: './product-form-categories.scss',
})
export class ProductFormCategories {
  readonly texts = input.required<ProductFormTexts>();
  readonly categories = input.required<ProductFormCategoryNode[]>();
  readonly sidebarDisabled = input<boolean>(false);

  readonly categoryToggle = output<ProductFormCategoryToggleEvent>();

  protected onCategoryCheckedChange(categoryId: string, checked: boolean): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedCategoryId = categoryId.trim();
    if (!normalizedCategoryId) {
      return;
    }

    this.categoryToggle.emit({ categoryId: normalizedCategoryId, checked });
  }
}
