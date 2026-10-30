import { Component, input, output } from '@angular/core';

/** Apply (form submit) + reset buttons; place inside an `app-filter-bar`. */
@Component({
  selector: 'app-filter-actions',
  templateUrl: './filter-actions.html',
  styleUrl: './filter-actions.scss',
})
export class FilterActions {
  public readonly applyLabel = input.required<string>();
  public readonly resetLabel = input.required<string>();
  public readonly applyDisabled = input<boolean>(false);
  public readonly resetDisabled = input<boolean>(false);
  public readonly cleared = output<void>();
}
