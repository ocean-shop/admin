import { Injectable } from '@angular/core';
import { LOCAL_STORAGE_LOG_MESSAGES } from '@core/constants/local-storage.constants';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(LOCAL_STORAGE_LOG_MESSAGES.READ_ERROR(key), error);
      return null;
    }
  }

  setItem(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(LOCAL_STORAGE_LOG_MESSAGES.SAVE_ERROR(key), error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(LOCAL_STORAGE_LOG_MESSAGES.REMOVE_ERROR(key), error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(LOCAL_STORAGE_LOG_MESSAGES.CLEAR_ERROR, error);
    }
  }
}
