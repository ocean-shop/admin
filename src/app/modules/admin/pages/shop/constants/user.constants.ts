import { TableColumn } from '@ui/table/models/table-column.model';

export const USER_OTP_COLUMNS: TableColumn[] = [
  { key: 'channel', header: 'channel' },
  { key: 'purpose', header: 'purpose' },
  { key: 'attempts', header: 'attempts', align: 'right' },
];

export const USER_SESSION_COLUMNS: TableColumn[] = [
  { key: 'user_agent', header: 'user_agent' },
  { key: 'ip_address', header: 'ip_address' },
  { key: 'device_name', header: 'device_name' },
];
