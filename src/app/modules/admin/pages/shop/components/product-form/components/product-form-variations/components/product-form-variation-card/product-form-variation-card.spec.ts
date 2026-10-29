import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createEmptyProductFormVariation } from '../../../../../../helpers/product-variation-mapping.helper';
import {
  PRODUCT_FORM_TEXTS,
  PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES,
} from '../../../../constants/product-form.constants';
import { ProductFormVariation } from '../../../../models/product-form-variation.model';
import { ProductFormVariationCard } from './product-form-variation-card';

describe('ProductFormVariationCard', () => {
  let fixture: ComponentFixture<ProductFormVariationCard>;
  let element: HTMLElement;

  const render = async (overrides: Partial<ProductFormVariation> = {}): Promise<void> => {
    fixture.componentRef.setInput('variation', {
      ...createEmptyProductFormVariation('local-1'),
      title: 'Синій M',
      ...overrides,
    });
    await fixture.whenStable();
  };

  const saveButton = (): HTMLButtonElement =>
    element.querySelector('.variation-card-save') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormVariationCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormVariationCard);
    element = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    await render();
  });

  it('renders the numbered title and field ids of the variation', () => {
    expect(element.textContent).toContain(`${PRODUCT_FORM_TEXTS.VARIATION_CARD_TITLE} #2`);
    expect(
      element.querySelector(`#${PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES.TITLE}local-1`),
    ).not.toBeNull();
  });

  it('shows create, update and saving labels', async () => {
    expect(saveButton().textContent).toContain(PRODUCT_FORM_TEXTS.VARIATION_CREATE_BUTTON_LABEL);

    await render({ id: 'var-1' });
    expect(saveButton().textContent).toContain(PRODUCT_FORM_TEXTS.VARIATION_UPDATE_BUTTON_LABEL);

    await render({ isSaving: true });
    expect(saveButton().textContent).toContain(
      PRODUCT_FORM_TEXTS.VARIATION_CREATE_LOADING_BUTTON_LABEL,
    );
    expect(saveButton().disabled).toBe(true);
  });

  it('disables the save button when the card is disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(saveButton().disabled).toBe(true);
  });

  it('emits saved and removed', () => {
    const saved = vi.fn();
    const removed = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance.removed.subscribe(removed);

    saveButton().click();
    (element.querySelector('.variation-card-remove') as HTMLButtonElement).click();

    expect(saved).toHaveBeenCalled();
    expect(removed).toHaveBeenCalled();
  });

  it('emits field changes with the field name', () => {
    const fieldChange = vi.fn();
    fixture.componentInstance.fieldChange.subscribe(fieldChange);

    (fixture.componentInstance as any).onFieldChange('sku', 'SKU-1');

    expect(fieldChange).toHaveBeenCalledWith({ field: 'sku', value: 'SKU-1' });
  });
});
