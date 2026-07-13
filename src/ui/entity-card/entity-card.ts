import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EntityCardData } from './models/entity-card.model';

@Component({
  selector: 'app-entity-card',
  templateUrl: './entity-card.html',
  styleUrl: './entity-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class EntityCard {
  readonly entity = input.required<EntityCardData>();
  readonly icon = input<string>('person');

  readonly edit = output<void>();
  readonly removed = output<void>();

  protected onEdit(): void {
    this.edit.emit();
  }

  protected onDelete(): void {
    this.removed.emit();
  }
}

export type { EntityCardData };
