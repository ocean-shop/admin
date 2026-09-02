import { Component, computed, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-checkbox',
  imports: [FormField],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
})
export class Checkbox {
  public readonly id = input<string>('');
  public readonly label = input.required<string>();
  public readonly control = input<any>();
  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly inputId = computed(() => this.id().trim() || this.generatedId);
  public readonly checkedChange = output<boolean>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }

  private static nextCheckboxId = 0;
  private readonly generatedId = `admin-checkbox-${Checkbox.nextCheckboxId++}`;
}
