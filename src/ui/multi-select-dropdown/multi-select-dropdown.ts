import { Component, HostListener, computed, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { DropdownTriggerMode } from '@ui/dropdown/models/dropdown-trigger-mode.type';
import { DropdownVariant } from '@ui/dropdown/models/dropdown-variant.type';
import { DropdownTreeOption } from '@ui/multi-select-dropdown/models/dropdown-tree-option.type';
import { MultiSelectOptionVariant } from '@ui/multi-select-dropdown/models/multi-select-option-variant.type';

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.html',
  styleUrl: './multi-select-dropdown.scss',
})
export class MultiSelectDropdown implements FormValueControl<string[]> {
  public readonly value = model<string[]>([]);
  public readonly label = input<string>('Select options');
  public readonly icon = input<string>();
  public readonly options = input.required<(DropdownOption | DropdownTreeOption)[]>();
  public readonly triggerMode = input<DropdownTriggerMode>('click');
  public readonly variant = input<DropdownVariant>('default');
  public readonly optionVariant = input<MultiSelectOptionVariant>('basic');
  public readonly optionToggled = output<DropdownOption>();

  protected readonly isOpen = signal(false);
  protected readonly displayOptions = computed<DropdownTreeOption[]>(() =>
    this.normalizeOptions(this.options(), this.optionVariant()),
  );

  protected readonly displayLabel = computed(() => {
    const selectedValues = this.value();
    if (!selectedValues.length) {
      return this.label();
    }

    const selectedOptions = this.options().filter((option) =>
      selectedValues.includes(option.value),
    );
    if (!selectedOptions.length) {
      return this.label();
    }

    if (selectedOptions.length === 1) {
      return selectedOptions[0].label;
    }

    return `${selectedOptions.length} selected`;
  });

  protected toggleMenu(event: Event): void {
    if (this.triggerMode() !== 'click') {
      return;
    }

    event.stopPropagation();
    this.isOpen.update((open) => !open);
  }

  protected toggleOption(option: DropdownOption, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.value.update((currentValues) => {
      const hasOption = currentValues.includes(option.value);
      if (hasOption) {
        return currentValues.filter((value) => value !== option.value);
      }

      return [...currentValues, option.value];
    });

    this.optionToggled.emit(option);
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  protected resolveOptionPadding(option: DropdownTreeOption): number {
    return 16 + option.level * 16;
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    if (this.triggerMode() === 'click') {
      this.isOpen.set(false);
    }
  }

  private normalizeOptions(
    options: (DropdownOption | DropdownTreeOption)[],
    optionVariant: MultiSelectOptionVariant,
  ): DropdownTreeOption[] {
    if (optionVariant === 'tree') {
      return options.map((option) => ({
        ...option,
        level: this.resolveOptionLevel(option),
      }));
    }

    return options.map((option) => ({
      ...option,
      level: 0,
    }));
  }

  private resolveOptionLevel(option: DropdownOption | DropdownTreeOption): number {
    if ('level' in option && typeof option.level === 'number' && option.level >= 0) {
      return option.level;
    }

    return 0;
  }
}
