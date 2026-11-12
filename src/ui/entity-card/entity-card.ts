import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge } from '@ui/badge/badge';
import { ENTITY_CARD_ICONS, ENTITY_CARD_TEXTS } from './constants/entity-card.constants';
import { EntityCardData } from './models/entity-card.model';

@Component({
  selector: 'app-entity-card',
  imports: [RouterLink, Badge],
  templateUrl: './entity-card.html',
  styleUrl: './entity-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCard {
  public readonly entity = input.required<EntityCardData>();
  public readonly icon = input<string>('person');
  public readonly edit = output<void>();
  public readonly removed = output<void>();

  protected readonly textData = ENTITY_CARD_TEXTS;
  protected readonly icons = ENTITY_CARD_ICONS;

  protected onEdit(): void {
    this.edit.emit();
  }

  protected onDelete(): void {
    this.removed.emit();
  }
}
