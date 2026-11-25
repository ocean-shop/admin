import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { REVIEW_STATUS_ACTIONS, REVIEWS_TEXTS } from '../../constants/reviews.constants';
import { ReviewStatus } from '../../models/review-status.enum';
import { Review } from '../../models/review.model';
import { UpdateReviewStatusVariables } from '../../models/update-review-status-variables.model';
import { ReviewsList } from './reviews-list';

const buildReview = (overrides: Partial<Review> = {}): Review => ({
  id: 'r-1',
  name: 'Олена Коваль',
  initials: 'ОК',
  rating: 4,
  ratingText: '4.0',
  ratingLabel: 'Оцінка 4 з 5',
  stars: [true, true, true, true, false],
  comment: 'Чудовий телефон',
  advantages: 'Камера',
  drawbacks: 'Ціна',
  productId: 'p-1',
  productName: 'Iphone 14 pro max',
  status: ReviewStatus.Approved,
  statusLabel: 'Схвалено',
  statusTone: 'success',
  approvedPurchase: true,
  usefulCount: 2,
  createdDate: '23.11.2026',
  ...overrides,
});

describe('ReviewsList', () => {
  let fixture: ComponentFixture<ReviewsList>;
  let element: HTMLElement;

  const render = async (reviews: Review[], loading = false) => {
    fixture.componentRef.setInput('reviews', reviews);
    fixture.componentRef.setInput('loading', loading);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsList);
  });

  it('renders the loading state', async () => {
    await render([buildReview()], true);

    expect(element.textContent).toContain(REVIEWS_TEXTS.LIST_LOADING_TEXT);
    expect(element.querySelector('.review-item')).toBeNull();
  });

  it('renders a full review', async () => {
    await render([buildReview()]);

    const text = element.textContent ?? '';
    expect(text).toContain('Олена Коваль');
    expect(text).toContain('Чудовий телефон');
    expect(text).toContain(REVIEWS_TEXTS.ADVANTAGES_LABEL);
    expect(text).toContain(REVIEWS_TEXTS.DRAWBACKS_LABEL);
    expect(text).toContain(REVIEWS_TEXTS.APPROVED_PURCHASE_LABEL);
    expect(text).toContain(REVIEWS_TEXTS.USEFUL_LABEL);
    expect(text).toContain('Схвалено');
    expect(element.querySelectorAll('.review-star-filled')).toHaveLength(4);
    expect(element.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Оцінка 4 з 5');
  });

  it('hides optional parts and renders product as text without id', async () => {
    await render([
      buildReview({
        advantages: null,
        drawbacks: null,
        approvedPurchase: false,
        usefulCount: 0,
        productId: null,
      }),
    ]);

    const text = element.textContent ?? '';
    expect(text).not.toContain(REVIEWS_TEXTS.ADVANTAGES_LABEL);
    expect(text).not.toContain(REVIEWS_TEXTS.DRAWBACKS_LABEL);
    expect(text).not.toContain(REVIEWS_TEXTS.APPROVED_PURCHASE_LABEL);
    expect(text).not.toContain(REVIEWS_TEXTS.USEFUL_LABEL);
    expect(element.querySelector('.review-product-link')).toBeNull();
    expect(text).toContain('Iphone 14 pro max');
  });

  it('emits the product id on product click', async () => {
    await render([buildReview()]);
    const emitted: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => emitted.push(id));

    element.querySelector<HTMLButtonElement>('.review-product-link')?.click();

    expect(emitted).toEqual(['p-1']);
  });

  it('shows only the actions for statuses other than the current one', async () => {
    await render([buildReview({ status: ReviewStatus.Pending })]);

    const labels = Array.from(element.querySelectorAll('.review-actions .admin-btn-label')).map(
      (button) => button.textContent?.trim(),
    );
    expect(labels).toEqual(
      REVIEW_STATUS_ACTIONS.filter((action) => action.status !== ReviewStatus.Pending).map(
        (action) => action.label,
      ),
    );
  });

  it('emits the status change on action click', async () => {
    await render([buildReview({ status: ReviewStatus.Approved })]);
    const emitted: UpdateReviewStatusVariables[] = [];
    fixture.componentInstance.statusChange.subscribe((value) => emitted.push(value));

    element.querySelectorAll<HTMLButtonElement>('.review-actions button').forEach((button) => {
      button.click();
    });

    expect(emitted).toEqual([
      { id: 'r-1', status: ReviewStatus.Rejected },
      { id: 'r-1', status: ReviewStatus.Pending },
    ]);
  });

  it('locks actions while a status change is pending', async () => {
    fixture.componentRef.setInput('pendingStatusChange', {
      id: 'r-1',
      status: ReviewStatus.Rejected,
    });
    await render([buildReview()]);
    const emitted: UpdateReviewStatusVariables[] = [];
    fixture.componentInstance.statusChange.subscribe((value) => emitted.push(value));

    const buttons = element.querySelectorAll<HTMLButtonElement>('.review-actions button');
    expect(Array.from(buttons).every((button) => button.disabled)).toBe(true);

    (fixture.componentInstance as any).onStatusChange(buildReview(), ReviewStatus.Pending);
    expect(emitted).toEqual([]);
  });

  it('does not emit the current status', () => {
    const emitted: UpdateReviewStatusVariables[] = [];
    fixture.componentInstance.statusChange.subscribe((value) => emitted.push(value));

    (fixture.componentInstance as any).onStatusChange(buildReview(), ReviewStatus.Approved);

    expect(emitted).toEqual([]);
  });

  it('does not emit without a product id', () => {
    const emitted: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => emitted.push(id));

    (fixture.componentInstance as any).onOpenProduct(buildReview({ productId: null }));

    expect(emitted).toEqual([]);
  });
});
