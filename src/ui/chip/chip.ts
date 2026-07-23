import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChipVariant } from './models/chip-variant.type';

@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Chip {
  readonly label = input.required<string>();
  readonly removeAriaLabel = input.required<string>();
  readonly variant = input<ChipVariant>('attribute');
  readonly disabled = input<boolean>(false);

  readonly remove = output<void>();

  protected onRemoveClick(): void {
    if (this.disabled()) {
      return;
    }

    this.remove.emit();
  }
}
