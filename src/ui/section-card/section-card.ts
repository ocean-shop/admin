import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.html',
  styleUrl: './section-card.scss',
})
export class SectionCard {
  public readonly title = input.required<string>();
  /** Material Symbols name shown before the title. */
  public readonly icon = input<string>('');
  public readonly description = input<string>('');
}
