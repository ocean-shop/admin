import { createDebouncedScheduler } from './debounced-scheduler.helper';

describe('createDebouncedScheduler', () => {
  const delayMs = 100;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the task once after the delay', () => {
    const scheduler = createDebouncedScheduler(delayMs);
    const task = vi.fn();

    scheduler.schedule('a', task);
    vi.advanceTimersByTime(delayMs - 1);
    expect(task).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('debounces repeated schedules of the same key', () => {
    const scheduler = createDebouncedScheduler(delayMs);
    const first = vi.fn();
    const second = vi.fn();

    scheduler.schedule('a', first);
    scheduler.schedule('a', second);
    vi.advanceTimersByTime(delayMs);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('keeps different keys independent', () => {
    const scheduler = createDebouncedScheduler(delayMs);
    const first = vi.fn();
    const second = vi.fn();

    scheduler.schedule('a', first);
    scheduler.schedule('b', second);
    vi.advanceTimersByTime(delayMs);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('reports a running task as stale once the key is rescheduled', () => {
    const scheduler = createDebouncedScheduler(delayMs);
    let isLatest: () => boolean = () => false;

    scheduler.schedule('a', (check) => (isLatest = check));
    vi.advanceTimersByTime(delayMs);
    expect(isLatest()).toBe(true);

    scheduler.schedule('a', vi.fn());
    expect(isLatest()).toBe(false);
  });

  it('cancel drops the pending task and marks running ones as stale', () => {
    const scheduler = createDebouncedScheduler(delayMs);
    let isLatest: () => boolean = () => false;
    const pending = vi.fn();

    scheduler.schedule('a', (check) => (isLatest = check));
    vi.advanceTimersByTime(delayMs);
    scheduler.schedule('b', pending);
    scheduler.cancel('a');
    scheduler.cancel('b');
    vi.advanceTimersByTime(delayMs);

    expect(isLatest()).toBe(false);
    expect(pending).not.toHaveBeenCalled();
  });

  it('cancelAll drops every pending task', () => {
    const scheduler = createDebouncedScheduler(delayMs);
    const first = vi.fn();
    const second = vi.fn();

    scheduler.schedule('a', first);
    scheduler.schedule('b', second);
    scheduler.cancelAll();
    vi.advanceTimersByTime(delayMs);

    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });
});
