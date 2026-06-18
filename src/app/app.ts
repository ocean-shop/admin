import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toaster } from '@ui/toaster/toaster';
import { Loader } from '@ui/loader/loader';
import { LoaderService } from './core/services/loader/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private loaderService = inject(LoaderService);

  protected readonly title = signal('admin');
  isLoading = this.loaderService.isLoading;
}
