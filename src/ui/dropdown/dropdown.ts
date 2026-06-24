import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import { DropdownOption } from './models/dropdown.type';
import { DropdownTriggerMode } from './models/dropdown-trigger-mode.type';
import { DropdownVariant } from './models/dropdown-variant.type';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  label = input.required<string>();
  icon = input<string>();
  options = input.required<DropdownOption[]>();
  triggerMode = input<DropdownTriggerMode>('hover');
  variant = input<DropdownVariant>('default');

  optionSelected = output<DropdownOption>();

  protected readonly isOpen = signal(false);

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
    this.optionSelected.emit(option);
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    if (this.triggerMode() === 'click') {
      this.isOpen.set(false);
    }
  }
}
