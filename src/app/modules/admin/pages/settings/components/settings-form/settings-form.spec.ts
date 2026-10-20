import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  DEFAULT_LANGUAGE,
  SETTINGS_UPDATED_SUCCESS_MESSAGE,
} from '../../constants/settings.constants';
import { SettingsService } from '../../services/settings.service';
import { SettingsForm } from './settings-form';

describe('SettingsForm', () => {
  let fixture: ComponentFixture<SettingsForm>;
  let component: SettingsForm;
  let mockSettingsService: {
    getUserSettings: ReturnType<typeof vi.fn>;
    setUserSettings: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: { success: ReturnType<typeof vi.fn> };

  const createComponent = async () => {
    fixture = TestBed.createComponent(SettingsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  beforeEach(async () => {
    mockSettingsService = {
      getUserSettings: vi.fn().mockReturnValue(of({ language: 'ua' })),
      setUserSettings: vi.fn().mockReturnValue(of({ language: 'ru' })),
    };
    mockToasterService = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SettingsForm],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: AuthService, useValue: { getUserId: vi.fn().mockReturnValue('user-1') } },
      ],
    }).compileComponents();
  });

  it('loads user settings and applies language', async () => {
    await createComponent();

    expect(mockSettingsService.getUserSettings).toHaveBeenCalledWith('user-1');
    expect((component as any).settingsForm.language().value()).toBe('ua');
    expect((component as any).isLoading()).toBe(false);
  });

  it('keeps default language when loaded language is unsupported', async () => {
    mockSettingsService.getUserSettings.mockReturnValue(of({ language: 'xx' }));

    await createComponent();

    expect((component as any).settingsForm.language().value()).toBe(DEFAULT_LANGUAGE);
  });

  it('stops loading when settings request fails', async () => {
    mockSettingsService.getUserSettings.mockReturnValue(throwError(() => new Error('fail')));

    await createComponent();

    expect((component as any).isLoading()).toBe(false);
  });

  it('saves settings and shows success toast', async () => {
    await createComponent();

    (component as any).onSubmit();

    expect(mockSettingsService.setUserSettings).toHaveBeenCalledWith({
      language: 'ua',
      userId: 'user-1',
    });
    expect((component as any).settingsForm.language().value()).toBe('ru');
    expect(mockToasterService.success).toHaveBeenCalledWith(SETTINGS_UPDATED_SUCCESS_MESSAGE);
    expect((component as any).isLoading()).toBe(false);
  });

  it('does not submit invalid form', async () => {
    await createComponent();
    (component as any).settingsModel.set({ language: '' });

    (component as any).onSubmit();

    expect(mockSettingsService.setUserSettings).not.toHaveBeenCalled();
    expect((component as any).isLoading()).toBe(false);
  });

  it('stops loading when save fails', async () => {
    mockSettingsService.setUserSettings.mockReturnValue(throwError(() => new Error('fail')));
    await createComponent();

    (component as any).onSubmit();

    expect((component as any).isLoading()).toBe(false);
    expect(mockToasterService.success).not.toHaveBeenCalled();
  });
});
