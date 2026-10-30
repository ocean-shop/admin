import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mapAttributeSearchResults } from '../../../../../../helpers/product-search-results/product-search-results.helper';
import { PRODUCT_FORM_TOAST_TEXTS } from '../../../../constants/product-form.constants';
import { ProductFormAssignableToggle } from '../../../../models/product-form-assignable-toggle.model';
import { ProductFormAssignableToastTexts } from '../../../../models/product-form-assignable-toast-texts.model';
import { ProductFormOption } from '../../../../models/product-form-option.model';
import { ProductFormAssignableSectionService } from '../../../../services/product-form-assignable-section/product-form-assignable-section.service';

@Injectable()
export class ProductAttributesService extends ProductFormAssignableSectionService {
  protected readonly toastTexts: ProductFormAssignableToastTexts = {
    ASSIGN_SUCCESS_TITLE: PRODUCT_FORM_TOAST_TEXTS.ATTRIBUTE_ASSIGN_SUCCESS_TITLE,
    UNASSIGN_SUCCESS_TITLE: PRODUCT_FORM_TOAST_TEXTS.ATTRIBUTE_UNASSIGN_SUCCESS_TITLE,
  };

  protected async searchItems(shopId: string, name: string): Promise<ProductFormOption[]> {
    const items = await this.searchService.searchAttributes(shopId, name);
    return mapAttributeSearchResults(items, this.assignedItems());
  }

  protected toggleItem({
    productId,
    itemId,
    assign,
  }: ProductFormAssignableToggle): Observable<unknown> {
    return this.productsService.toggleAttribute(productId, { attributeTypeId: itemId, assign });
  }
}
