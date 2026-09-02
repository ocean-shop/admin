import { Admin, AdminsPagination } from './admin.model';

export type AdminsMappedResponse = {
  admins: Admin[];
  pagination: AdminsPagination;
};
