import { Component, computed, input } from '@angular/core';
import { buildShareBarSegments } from './helpers/share-bar/share-bar.helper';
import { ShareBarSegment } from './models/share-bar-segment.model';

/** Horizontal share bar: one segment for a progress line, several for a stacked split. */
@Component({
  selector: 'app-share-bar',
  templateUrl: './share-bar.html',
  styleUrl: './share-bar.scss',
})
export class ShareBar {
  public readonly segments = input.required<ShareBarSegment[]>();
  /** Text alternative for the whole bar; without it the bar is decorative. */
  public readonly ariaLabel = input<string>('');
  /** Tall bar with segment labels inside. */
  public readonly large = input<boolean>(false);

  protected readonly views = computed(() => buildShareBarSegments(this.segments()));
}
