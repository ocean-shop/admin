import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserCardData } from './models/user-card.model';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class UserCard {
  readonly user = input.required<UserCardData>();

  readonly edit = output<void>();
  readonly removed = output<void>();

  protected onEdit(): void {
    this.edit.emit();
  }

  protected onDelete(): void {
    this.removed.emit();
  }
}
