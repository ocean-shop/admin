import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  SETTINGS_CACHE_INVALIDATED_SUCCESS_MESSAGE,
  SETTINGS_PAGE_TITLE,
} from './constants/settings.constants';
import { SettingsService } from './services/settings.service';
import { Settings } from './settings';

describe('Settings', () => {
  let fixture: ComponentFixture<Settings>;
  let component: Settings;
  let mockSettingsService: {
    getUserSettings: ReturnType<typeof vi.fn>;
    setUserSettings: ReturnType<typeof vi.fn>;
    invalidateCache: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: { success: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockSettingsService = {
      getUserSettings: vi.fn().mockReturnValue(of({ language: 'en' })),
      setUserSettings: vi.fn(),
      invalidateCache: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: AuthService, useValue: { getUserId: vi.fn().mockReturnValue('user-1') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders page title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(SETTINGS_PAGE_TITLE);
  });

  it('invalidates cache and shows success toast', () => {
    (component as any).onInvalidateCache();

    expect(mockSettingsService.invalidateCache).toHaveBeenCalled();
    expect(mockToasterService.success).toHaveBeenCalledWith(
      SETTINGS_CACHE_INVALIDATED_SUCCESS_MESSAGE,
    );
    expect((component as any).isCacheInvalidating()).toBe(false);
  });

  it('ignores repeated clicks while cache invalidation is in progress', () => {
    const pending$ = new Subject<void>();
    mockSettingsService.invalidateCache.mockReturnValue(pending$);

    (component as any).onInvalidateCache();
    (component as any).onInvalidateCache();

    expect(mockSettingsService.invalidateCache).toHaveBeenCalledTimes(1);
    expect((component as any).isCacheInvalidating()).toBe(true);
  });

  it('resets loading state when cache invalidation fails', () => {
    mockSettingsService.invalidateCache.mockReturnValue(throwError(() => new Error('fail')));

    (component as any).onInvalidateCache();

    expect((component as any).isCacheInvalidating()).toBe(false);
    expect(mockToasterService.success).not.toHaveBeenCalled();
  });
});
