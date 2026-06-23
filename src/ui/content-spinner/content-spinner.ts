import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-content-spinner',
  imports: [],
  templateUrl: './content-spinner.html',
  styleUrl: './content-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentSpinner {}
