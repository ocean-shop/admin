import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BREADCRUMBS_SEPARATOR_ICON } from './constants/breadcrumbs.constants';
import { BreadcrumbItem } from './models/breadcrumb-item.model';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  templateUrl: './breadcrumbs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumbs {
  readonly items = input.required<BreadcrumbItem[]>();
  protected readonly separatorIcon = BREADCRUMBS_SEPARATOR_ICON;
  protected readonly breadcrumbs = computed(() => this.items());
}
