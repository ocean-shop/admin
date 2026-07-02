import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { DropdownOption } from './models/dropdown.type';
import { DropdownTriggerMode } from './models/dropdown-trigger-mode.type';
import { DropdownVariant } from './models/dropdown-variant.type';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Dropdown implements FormValueControl<string> {
  readonly value = model<string>('');

  label = input<string>();
  icon = input<string>();
  options = input.required<DropdownOption[]>();
  triggerMode = input<DropdownTriggerMode>('hover');
  variant = input<DropdownVariant>('default');

  optionSelected = output<DropdownOption>();

  protected readonly isOpen = signal(false);

  protected readonly displayLabel = computed(() => {
    const explicitLabel = this.label();
    if (explicitLabel) {
      return explicitLabel;
    }

    const selected = this.options().find((option) => option.value === this.value());
    return selected?.label ?? this.options()[0]?.label ?? '';
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
