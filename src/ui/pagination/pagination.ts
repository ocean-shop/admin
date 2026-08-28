import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly label = input<string>('admins');

  readonly pageChange = output<number>();

  protected readonly isPrevDisabled = computed(() => this.currentPage() <= 1);
  protected readonly isNextDisabled = computed(
    () => this.currentPage() >= this.totalPages() || this.totalPages() <= 1,
  );

  protected readonly startItem = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }

    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  protected readonly endItem = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }

    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  protected readonly visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const halfWindow = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - halfWindow);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  protected changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }

  protected previousPage(): void {
    this.changePage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.changePage(this.currentPage() + 1);
  }
}
