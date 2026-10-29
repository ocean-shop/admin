import {
  ATTRIBUTES_DEFAULT_NAME,
  ATTRIBUTES_DEFAULT_VALUE,
} from '../constants/attributes.constants';
import { Attribute, AttributeApiItem } from '../models/attribute.model';

export const mapAttribute = (attribute: AttributeApiItem, fallbackShopId: string): Attribute => ({
  id: attribute.id?.trim() || crypto.randomUUID(),
  shopId: attribute.shopId?.trim() || fallbackShopId,
  name: attribute.name?.trim() || ATTRIBUTES_DEFAULT_NAME,
  value: attribute.value?.trim() || ATTRIBUTES_DEFAULT_VALUE,
  ...(attribute.createdAt?.trim() ? { createdAt: attribute.createdAt } : {}),
  ...(attribute.updatedAt?.trim() ? { updatedAt: attribute.updatedAt } : {}),
});
