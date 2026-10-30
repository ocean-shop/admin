import { HttpErrorResponse } from '@angular/common/http';
import { HTTP_ERROR_TEXTS } from '@core/constants/http-error.constants';
import { buildHttpErrorToast, isHttpErrorStatus } from './http-error.helper';

const buildError = (status: number, error: unknown, statusText = 'Error'): HttpErrorResponse =>
  new HttpErrorResponse({ status, error, statusText, url: '/api' });

describe('http-error.helper', () => {
  describe('buildHttpErrorToast', () => {
    it('uses the throttling texts for 429 without a server message', () => {
      expect(buildHttpErrorToast(buildError(429, null))).toEqual({
        title: HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_TITLE,
        message: HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_MESSAGE,
      });
    });

    it('prefers the server message for 429', () => {
      expect(buildHttpErrorToast(buildError(429, { message: 'Wait' })).message).toBe('Wait');
    });

    it('builds a status title and trims the server message', () => {
      expect(buildHttpErrorToast(buildError(400, { message: '  Bad input ' }))).toEqual({
        title: `${HTTP_ERROR_TEXTS.ERROR_TITLE_PREFIX} 400`,
        message: 'Bad input',
      });
    });

    it('joins string arrays and drops non-string entries', () => {
      const toast = buildHttpErrorToast(buildError(422, { message: ['a', 1, 'b'] }));

      expect(toast.message).toBe('a, b');
    });

    it('falls back to the HttpErrorResponse message when the body has none', () => {
      const error = buildError(500, 'plain text', 'Server Error');

      expect(buildHttpErrorToast(error).message).toBe(error.message);
    });

    it('ignores non-string, non-array server messages', () => {
      const error = buildError(500, { message: { nested: true } });

      expect(buildHttpErrorToast(error).message).toBe(error.message);
    });

    it('falls back to the generic text when nothing else is available', () => {
      const error = { status: 500, error: null, message: '' } as HttpErrorResponse;

      expect(buildHttpErrorToast(error).message).toBe(HTTP_ERROR_TEXTS.UNEXPECTED_ERROR);
    });
  });

  describe('isHttpErrorStatus', () => {
    it('is true only for 4xx and 5xx', () => {
      expect(isHttpErrorStatus(0)).toBe(false);
      expect(isHttpErrorStatus(399)).toBe(false);
      expect(isHttpErrorStatus(400)).toBe(true);
      expect(isHttpErrorStatus(599)).toBe(true);
      expect(isHttpErrorStatus(600)).toBe(false);
    });
  });
});
