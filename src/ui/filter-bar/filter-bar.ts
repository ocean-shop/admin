import { Component, output } from '@angular/core';

/**
 * Filter form shell: `[filterFields]` content goes left, `[filterControls]` right.
 * Any projected `type="submit"` button triggers `applied`.
 */
@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  public readonly applied = output<void>();

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.applied.emit();
  }
}
