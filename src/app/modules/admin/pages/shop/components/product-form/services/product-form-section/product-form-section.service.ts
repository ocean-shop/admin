import { inject, Injectable, signal } from '@angular/core';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { invalidateProductQueries } from '../../../../helpers/product-query/product-query.helper';
import { ProductsService } from '../../../../pages/products/services/products/products.service';
import { PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR } from '../../constants/product-form.constants';
import { ProductFormEditorContext } from '../../models/product-form-editor-context.model';

/**
 * Shared plumbing for the editor sidebar sections: the host component passes its
 * inputs through `configure()`, and every section refreshes the same product caches.
 */
@Injectable()
export abstract class ProductFormSectionService {
  protected readonly productsService = inject(ProductsService);
  protected readonly queryClient = injectQueryClient();
  protected readonly toasterService = inject(ToasterService);

  /** A signal, so queries built from the context re-run once `configure()` is called. */
  private readonly context = signal<ProductFormEditorContext | null>(null);

  configure(context: ProductFormEditorContext): void {
    this.context.set(context);
  }

  protected isConfigured(): boolean {
    return this.context() !== null;
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
    const context = this.context();
    if (!context) {
      throw new Error(PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR);
    }

    return context;
  }
}
