import { ProductListQueryParams } from './product.model';

export type ProductSortQuery = Required<Pick<ProductListQueryParams, 'sortBy' | 'sortOrder'>>;
