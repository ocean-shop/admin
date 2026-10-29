/** Receives `isLatest`, which turns false once the key is rescheduled or cancelled. */
export type DebouncedTask = (isLatest: () => boolean) => void;

export type DebouncedScheduler = {
  schedule: (key: string, task: DebouncedTask) => void;
  cancel: (key: string) => void;
  cancelAll: () => void;
};
