import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_TILE_ARROW_ICON } from './constants/nav-tile.constants';
import { NavTileData } from './models/nav-tile.model';

/** Clickable navigation tile for section overviews (the whole tile is a link). */
@Component({
  selector: 'app-nav-tile',
  imports: [RouterLink],
  templateUrl: './nav-tile.html',
  styleUrl: './nav-tile.scss',
})
export class NavTile {
  public readonly tile = input.required<NavTileData>();

  protected readonly arrowIcon = NAV_TILE_ARROW_ICON;
  protected readonly ariaLabel = computed(() => `${this.tile().linkLabel}: ${this.tile().title}`);
}
