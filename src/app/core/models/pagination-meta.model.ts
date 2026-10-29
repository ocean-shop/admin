import { PaginatedResponse } from './paginated-response.model';

export type PaginationMeta = Omit<PaginatedResponse<never>, 'items'>;
