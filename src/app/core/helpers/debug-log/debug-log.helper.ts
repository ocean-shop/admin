import { isDevMode } from '@angular/core';

/** Dev-only console trace; never logs in production builds. */
export const logDebug = (scope: string, message: string, data?: unknown): void => {
  if (!isDevMode()) {
    return;
  }

  if (data === undefined) {
    console.debug(`[${scope}] ${message}`);
    return;
  }

  console.debug(`[${scope}] ${message}`, data);
};
