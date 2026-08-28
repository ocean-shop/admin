import { Component, HostListener, computed, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { DropdownOption } from './models/dropdown.type';
import { DropdownTriggerMode } from './models/dropdown-trigger-mode.type';
import { DropdownVariant } from './models/dropdown-variant.type';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
})
export class Dropdown implements FormValueControl<string> {
  public readonly value = model<string>('');
  public readonly label = input<string>();
  public readonly icon = input<string>();
  public readonly options = input.required<DropdownOption[]>();
  public readonly triggerMode = input<DropdownTriggerMode>('hover');
  public readonly variant = input<DropdownVariant>('default');
  public readonly optionSelected = output<DropdownOption>();

  protected readonly isOpen = signal(false);

  protected readonly displayLabel = computed(() => {
    const selected = this.options().find((option) => option.value === this.value());
    if (selected?.label) {
      return selected.label;
    }

    const explicitLabel = this.label();
    if (explicitLabel) {
      return explicitLabel;
    }

    return this.options()[0]?.label ?? '';
  });

  protected toggleMenu(event: Event): void {
    if (this.triggerMode() !== 'click') {
      return;
    }

    event.stopPropagation();
    this.isOpen.update((open) => !open);
  }

  protected selectOption(option: DropdownOption, event: Event): void {
    event.preventDefault();
    this.isOpen.set(false);
    this.value.set(option.value);
    this.optionSelected.emit(option);
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    if (this.triggerMode() === 'click') {
      this.isOpen.set(false);
    }
  }
}
