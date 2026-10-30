import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  HTTP_ERROR_STATUS_UPPER_BOUND,
  HTTP_ERROR_TEXTS,
} from '@core/constants/http-error.constants';
import { HttpErrorBody } from '@core/models/http-error-body.model';
import { HttpErrorToast } from '@core/models/http-error-toast.model';

/** Backends send `message` as a string or (validation errors) as a string array. */
const extractServerMessage = (body: unknown): string => {
  if (!body || typeof body !== 'object') {
    return '';
  }

  const { message } = body as HttpErrorBody;
  if (typeof message === 'string') {
    return message.trim();
  }

  if (Array.isArray(message)) {
    return message
      .filter((part): part is string => typeof part === 'string')
      .join(', ')
      .trim();
  }

  return '';
};

export const buildHttpErrorToast = (error: HttpErrorResponse): HttpErrorToast => {
  const serverMessage = extractServerMessage(error.error);

  if (error.status === HttpStatusCode.TooManyRequests) {
    return {
      title: HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_TITLE,
      message: serverMessage || HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_MESSAGE,
    };
  }

  return {
    title: `${HTTP_ERROR_TEXTS.ERROR_TITLE_PREFIX} ${error.status}`,
    message: serverMessage || error.message || HTTP_ERROR_TEXTS.UNEXPECTED_ERROR,
  };
};

export const isHttpErrorStatus = (status: number): boolean =>
  status >= HttpStatusCode.BadRequest && status < HTTP_ERROR_STATUS_UPPER_BOUND;
