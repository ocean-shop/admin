import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';

let nextCheckboxId = 0;

@Component({
  selector: 'app-checkbox',
  imports: [FormField],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Checkbox {
  private readonly generatedId = `admin-checkbox-${nextCheckboxId++}`;

  readonly id = input<string>('');
  readonly label = input.required<string>();
  readonly control = input<any>();
  readonly checked = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly inputId = computed(() => this.id().trim() || this.generatedId);

  readonly checkedChange = output<boolean>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
