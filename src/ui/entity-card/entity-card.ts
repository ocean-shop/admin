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
  public readonly entity = input.required<EntityCardData>();
  public readonly icon = input<string>('person');
  public readonly edit = output<void>();
  public readonly removed = output<void>();

  protected onEdit(): void {
    this.edit.emit();
  }

  protected onDelete(): void {
    this.removed.emit();
  }
}

export type { EntityCardData };
