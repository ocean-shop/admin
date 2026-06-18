import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService],
    });
    service = TestBed.inject(LocalStorageService);

    // Clear localStorage before each test
    localStorage.clear();

    // Clear mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItem', () => {
    it('should return parsed item when key exists in localStorage', () => {
      const testData = { id: 1, name: 'Test' };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const result = service.getItem<{ id: number; name: string }>('testKey');
      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', () => {
      const result = service.getItem('nonExistentKey');
      expect(result).toBeNull();
    });

    it('should return null and log error when JSON parsing fails', () => {
      // Setup invalid JSON
      localStorage.setItem('testKey', 'invalid-json{');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = service.getItem('testKey');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('Error reading testKey from localStorage');
    });

    it('should handle and log unexpected errors', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = service.getItem('testKey');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reading testKey from localStorage',
        expect.any(Error),
      );
    });
  });

  describe('setItem', () => {
    it('should stringify and save item to localStorage', () => {
      const testData = { success: true };
      service.setItem('testKey', testData);

      const storedItem = localStorage.getItem('testKey');
      expect(storedItem).toBe(JSON.stringify(testData));
    });

    it('should handle and log errors when setting item fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.setItem('testKey', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving testKey to localStorage',
        expect.any(Error),
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('testKey', 'test-value');
      service.removeItem('testKey');

      const storedItem = localStorage.getItem('testKey');
      expect(storedItem).toBeNull();
    });

    it('should handle and log errors when removing item fails', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Access denied');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.removeItem('testKey');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error removing testKey from localStorage',
        expect.any(Error),
      );
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      service.clear();

      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });

    it('should handle and log errors when clearing fails', () => {
      vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
        throw new Error('Access denied');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      service.clear();

      expect(consoleSpy).toHaveBeenCalledWith('Error clearing localStorage', expect.any(Error));
    });
  });
});
