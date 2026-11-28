import { Component, computed, input } from '@angular/core';
import { CHANGE_BADGE_ICONS } from './constants/change-badge.constants';
import { ChangeDirection } from './models/change-direction.type';
import { ChangeTone } from './models/change-tone.type';

/** Arrow + value pill for a change vs a previous period (`+5,0%`, `−3 п.п.`). */
@Component({
  selector: 'app-change-badge',
  templateUrl: './change-badge.html',
  styleUrl: './change-badge.scss',
})
export class ChangeBadge {
  public readonly label = input.required<string>();
  public readonly direction = input<ChangeDirection>('flat');
  /** Chosen by the caller: growing discounts are bad, growing sales are good. */
  public readonly tone = input<ChangeTone>('neutral');

  protected readonly icon = computed(() => CHANGE_BADGE_ICONS[this.direction()]);
}
