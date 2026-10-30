export const LOCAL_STORAGE_LOG_MESSAGES = {
  READ_ERROR: (key: string) => `Error reading ${key} from localStorage`,
  SAVE_ERROR: (key: string) => `Error saving ${key} to localStorage`,
  REMOVE_ERROR: (key: string) => `Error removing ${key} from localStorage`,
  CLEAR_ERROR: 'Error clearing localStorage',
} as const;
