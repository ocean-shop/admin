import { Component, input } from '@angular/core';

/** Metric tile: label + icon on top, large tabular value, optional helper line. */
@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly icon = input<string>('');
  public readonly helper = input<string>('');
}
