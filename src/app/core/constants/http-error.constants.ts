import { HttpContextToken } from '@angular/common/http';

export const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

/** First status code past the 4xx/5xx error range. */
export const HTTP_ERROR_STATUS_UPPER_BOUND = 600;

export const HTTP_ERROR_LOG_SCOPE = 'ErrorInterceptor';

/** Developer-facing: debug logs and internal `Error` messages, never shown in the UI. */
export const HTTP_ERROR_LOG_MESSAGES = {
  REQUEST_FAILED: 'Request failed',
  MISSING_ACCESS_TOKEN: 'Missing access token in refresh response',
} as const;

export const HTTP_ERROR_TEXTS = {
  ERROR_TITLE_PREFIX: 'Помилка',
  UNEXPECTED_ERROR: 'Сталася непередбачувана помилка',
  TOO_MANY_REQUESTS_TITLE: 'Забагато спроб',
  TOO_MANY_REQUESTS_MESSAGE: 'Забагато запитів. Спробуйте пізніше.',
} as const;
