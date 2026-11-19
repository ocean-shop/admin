import { Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { isHexColor, normalizeHexColor } from '@core/helpers/color/color.helper';
import { COLOR_FIELD_DEFAULT_COLOR } from './constants/color-field.constants';

/**
 * Native color swatch + hex text input bound to one Signal Forms string field.
 * Length/format limits come from the field schema (e.g. `maxLength(COLOR_FIELD_HEX_MAX_LENGTH)`).
 */
@Component({
  selector: 'app-color-field',
  imports: [FormField],
  templateUrl: './color-field.html',
  styleUrl: './color-field.scss',
})
export class ColorField {
  public readonly id = input.required<string>();
  public readonly control = input.required<FieldTree<string>>();
  /** Accessible names: the visible label lives in the surrounding row. */
  public readonly pickerLabel = input.required<string>();
  public readonly hexLabel = input.required<string>();
  /** Shown in the swatch while the typed hex is invalid. */
  public readonly fallbackColor = input<string>(COLOR_FIELD_DEFAULT_COLOR);

  protected readonly errorId = computed(() => `${this.id()}-error`);
  protected readonly pickerValue = computed(() => {
    const value = this.control()().value();

    return isHexColor(value) ? normalizeHexColor(value) : this.fallbackColor();
  });
  protected readonly errorMessage = computed(() => {
    const state = this.control()();
    if (!state.invalid()) {
      return '';
    }

    return state.errors()[0]?.message ?? '';
  });

  protected onPick(event: Event): void {
    const state = this.control()();
    state.value.set((event.target as HTMLInputElement).value);
    state.markAsDirty();
  }
}
