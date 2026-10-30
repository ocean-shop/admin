import { inject, Injectable } from '@angular/core';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { SHOP_QUERY_KEYS } from '../../../../constants/shop-query-keys.constants';
import { AttributeApiItem } from '../../../../pages/attributes/models/attribute.model';
import { AttributesService } from '../../../../pages/attributes/services/attributes/attributes.service';
import { TagApiItem } from '../../../../pages/tags/models/tag.model';
import { TagsService } from '../../../../pages/tags/services/tags/tags.service';
import {
  PRODUCT_FORM_SEARCH_QUERY_LIMIT,
  PRODUCT_FORM_SEARCH_QUERY_PAGE,
} from '../../constants/product-form.constants';

/** Cached name search used by the editor's tag / attribute pickers. */
@Injectable({ providedIn: 'root' })
export class ProductFormSearchService {
  private readonly attributesService = inject(AttributesService);
  private readonly tagsService = inject(TagsService);
  private readonly queryClient = injectQueryClient();

  async searchAttributes(shopId: string, name: string): Promise<AttributeApiItem[]> {
    const response = await this.queryClient.fetchQuery({
      queryKey: SHOP_QUERY_KEYS.attributesSearch(shopId, name),
      queryFn: () =>
        lastValueFrom(
          this.attributesService.getAttributes({
            page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
            limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
            shopId,
            name,
          }),
        ),
    });

    return response.items;
  }

  async searchTags(shopId: string, name: string): Promise<TagApiItem[]> {
    const response = await this.queryClient.fetchQuery({
      queryKey: SHOP_QUERY_KEYS.tagsSearch(shopId, name),
      queryFn: () =>
        lastValueFrom(
          this.tagsService.getTags({
            page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
            limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
            shopId,
            name,
          }),
        ),
    });

    return response.items;
  }
}
