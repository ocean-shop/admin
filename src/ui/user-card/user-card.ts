import { Component, computed, input, output } from '@angular/core';
import { EntityCard } from '@ui/entity-card/entity-card';
import { UserCardData } from './models/user-card.model';

@Component({
  selector: 'app-user-card',
  imports: [EntityCard],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  readonly user = input.required<UserCardData>();
  protected readonly entity = computed(() => ({
    id: this.user().id ?? crypto.randomUUID(),
    title: this.user().name,
    subtitle: this.user().email,
    detail: this.user().phone,
    badge: this.user().role,
  }));

  readonly edit = output<void>();
  readonly removed = output<void>();
}
