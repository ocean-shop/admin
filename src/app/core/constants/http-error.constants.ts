import { HttpContextToken } from '@angular/common/http';

export const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

export const HTTP_ERROR_TEXTS = {
  UNEXPECTED_ERROR: 'Сталася непередбачувана помилка',
  MISSING_ACCESS_TOKEN: 'Missing access token in refresh response',
};
