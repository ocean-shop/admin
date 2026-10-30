import { TAGS_DEFAULT_NAME } from '../../constants/tags.constants';
import { Tag, TagApiItem } from '../../models/tag.model';

export const mapTag = (tag: TagApiItem, fallbackShopId: string): Tag => ({
  id: tag.id?.trim() || crypto.randomUUID(),
  shopId: tag.shopId?.trim() || fallbackShopId,
  name: tag.name?.trim() || TAGS_DEFAULT_NAME,
  ...(tag.createdAt?.trim() ? { createdAt: tag.createdAt } : {}),
  ...(tag.updatedAt?.trim() ? { updatedAt: tag.updatedAt } : {}),
});
