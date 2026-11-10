import { Component, computed, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';

/** On/off toggle for instant boolean states ("Доступна", "Не індексувати"). Same API as Checkbox. */
@Component({
  selector: 'app-switch',
  imports: [FormField],
  templateUrl: './switch.html',
  styleUrl: './switch.scss',
})
export class Switch {
  public readonly id = input<string>('');
  public readonly label = input.required<string>();
  public readonly description = input<string>('');
  public readonly control = input<any>();
  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly inputId = computed(() => this.id().trim() || this.generatedId);
  public readonly checkedChange = output<boolean>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }

  private static nextSwitchId = 0;
  private readonly generatedId = `admin-switch-${Switch.nextSwitchId++}`;
}
