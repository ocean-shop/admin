import { DebouncedScheduler, DebouncedTask } from '@core/models/debounced-scheduler.model';

/**
 * Per-key debounce with a "latest request wins" guard, so a slow response never
 * overwrites the results of a newer (or cancelled) request for the same key.
 */
export const createDebouncedScheduler = (delayMs: number): DebouncedScheduler => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const versions = new Map<string, number>();

  const cancel = (key: string): void => {
    clearTimeout(timers.get(key));
    timers.delete(key);
    versions.set(key, (versions.get(key) ?? 0) + 1);
  };

  const schedule = (key: string, task: DebouncedTask): void => {
    cancel(key);
    const version = versions.get(key);
    const timer = setTimeout(() => {
      timers.delete(key);
      task(() => versions.get(key) === version);
    }, delayMs);
    timers.set(key, timer);
  };

  const cancelAll = (): void => {
    Array.from(versions.keys()).forEach(cancel);
  };

  return { schedule, cancel, cancelAll };
};
