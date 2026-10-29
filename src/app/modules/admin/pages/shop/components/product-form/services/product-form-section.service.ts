import { inject, Injectable } from '@angular/core';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { invalidateProductQueries } from '../../../helpers/product-query.helper';
import { ProductsService } from '../../../pages/products/services/products.service';
import { PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR } from '../constants/product-form.constants';
import { ProductFormEditorContext } from '../models/product-form-editor-context.model';

/**
 * Shared plumbing for the editor sidebar sections: the host component passes its
 * inputs through `configure()`, and every section refreshes the same product caches.
 */
@Injectable()
export abstract class ProductFormSectionService {
  protected readonly productsService = inject(ProductsService);
  protected readonly queryClient = injectQueryClient();
  protected readonly toasterService = inject(ToasterService);

  private context: ProductFormEditorContext | null = null;

  configure(context: ProductFormEditorContext): void {
    this.context = context;
  }

  protected getShopId(): string | null {
    return this.requireContext().getShopId()?.trim() || null;
  }

  protected getProductId(): string | null {
    return this.requireContext().getProductId()?.trim() || null;
  }

  protected isSidebarEnabled(): boolean {
    return this.requireContext().isSidebarEnabled();
  }

  protected invalidateProductQueries(productId: string): void {
    invalidateProductQueries(this.queryClient, productId, this.getShopId());
  }

  private requireContext(): ProductFormEditorContext {
    if (!this.context) {
      throw new Error(PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR);
    }

    return this.context;
  }
}
