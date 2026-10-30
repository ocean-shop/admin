import { Component, input } from '@angular/core';

/** Card shell of every product editor section; `[cardActions]` content goes next to the title. */
@Component({
  selector: 'app-product-form-card',
  templateUrl: './product-form-card.html',
  styleUrl: './product-form-card.scss',
})
export class ProductFormCard {
  public readonly title = input.required<string>();
  public readonly icon = input<string>('');
  public readonly disabled = input<boolean>(false);
}
