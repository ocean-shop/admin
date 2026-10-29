import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-input',
  templateUrl: './filter-input.html',
  styleUrl: './filter-input.scss',
})
export class FilterInput {
  public readonly inputId = input.required<string>();
  public readonly label = input.required<string>();
  public readonly placeholder = input<string>('');
  public readonly value = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
