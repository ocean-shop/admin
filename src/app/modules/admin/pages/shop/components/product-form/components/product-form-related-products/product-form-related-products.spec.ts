import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ProductsService } from '../../../../pages/products/services/products/products.service';
import {
  PRODUCT_FORM_RELATED_PRODUCTS_MAX,
  PRODUCT_FORM_TEXTS,
} from '../../constants/product-form.constants';
import { ProductFormSearchService } from '../../services/product-form-search/product-form-search.service';
import { ProductFormRelatedProducts } from './product-form-related-products';
import { ProductRelatedProductsService } from './services/product-related-products/product-related-products.service';

describe('ProductFormRelatedProducts', () => {
  let fixture: ComponentFixture<ProductFormRelatedProducts>;
  let component: ProductFormRelatedProducts;
  let relatedService: ProductRelatedProductsService;
  let getRelatedProducts: ReturnType<typeof vi.fn>;

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const create = async (sidebarDisabled = false): Promise<void> => {
    fixture = TestBed.createComponent(ProductFormRelatedProducts);
    component = fixture.componentInstance;
    relatedService = fixture.debugElement.injector.get(ProductRelatedProductsService);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', sidebarDisabled);
    await flushQueries(fixture);
  };

  beforeEach(async () => {
    getRelatedProducts = vi.fn().mockReturnValue(
      of([
        { id: 'p2', name: 'Fins', sku: 'FN-1', images: ['https://cdn/fins.jpg'] },
        { id: 'p3', name: 'Mask', status: 'draft' },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [ProductFormRelatedProducts],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        {
          provide: ProductsService,
          useValue: { getRelatedProducts, assignRelatedProducts: vi.fn() },
        },
        { provide: ProductFormSearchService, useValue: { searchProductsBySku: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('renders the title, counter and related rows in order', async () => {
    await create();

    const names = Array.from(
      element().querySelectorAll('.related-products-row .related-products-name'),
    ).map((node) => node.textContent?.trim());
    expect(element().textContent).toContain(PRODUCT_FORM_TEXTS.RELATED_PRODUCTS_TITLE);
    expect(element().querySelector('.related-products-counter')?.textContent).toContain(
      `2 / ${PRODUCT_FORM_RELATED_PRODUCTS_MAX}`,
    );
    expect(names).toEqual(['Fins', 'Mask']);
    expect(element().textContent).toContain(PRODUCT_FORM_TEXTS.RELATED_PRODUCTS_NO_SKU);
    expect(element().querySelector('app-badge')).not.toBeNull();
  });

  it('disables moving the first row up and the last row down', async () => {
    await create();

    const rows = element().querySelectorAll('.related-products-row');
    const firstUp = rows[0].querySelector<HTMLButtonElement>(
      `[aria-label="${PRODUCT_FORM_TEXTS.RELATED_PRODUCTS_MOVE_UP_LABEL}"]`,
    );
    const lastDown = rows[1].querySelector<HTMLButtonElement>(
      `[aria-label="${PRODUCT_FORM_TEXTS.RELATED_PRODUCTS_MOVE_DOWN_LABEL}"]`,
    );
    expect(firstUp?.disabled).toBe(true);
    expect(lastDown?.disabled).toBe(true);
  });

  it('shows the empty state and skips loading while the sidebar is disabled', async () => {
    await create(true);

    expect(getRelatedProducts).not.toHaveBeenCalled();
    expect(element().textContent).toContain(PRODUCT_FORM_TEXTS.RELATED_PRODUCTS_EMPTY);
  });

  it('opens the results panel with the empty search state', async () => {
    await create();

    relatedService.searchValue.set('SKU');
    await fixture.whenStable();

    expect(element().textContent).toContain(PRODUCT_FORM_TEXTS.RELATED_PRODUCTS_SEARCH_EMPTY);
  });

  it('delegates user actions to the service', async () => {
    await create();
    const search = vi.spyOn(relatedService, 'onSearchChange').mockImplementation(() => undefined);
    const add = vi.spyOn(relatedService, 'onAdd').mockImplementation(() => undefined);
    const remove = vi.spyOn(relatedService, 'onRemove').mockImplementation(() => undefined);
    const up = vi.spyOn(relatedService, 'onMoveUp').mockImplementation(() => undefined);
    const down = vi.spyOn(relatedService, 'onMoveDown').mockImplementation(() => undefined);

    (component as any).onSearchChange('FN');
    (component as any).onAdd('p4');
    (component as any).onRemove('p2');
    (component as any).onMoveUp('p3');
    (component as any).onMoveDown('p2');

    expect(search).toHaveBeenCalledWith('FN');
    expect(add).toHaveBeenCalledWith('p4');
    expect(remove).toHaveBeenCalledWith('p2');
    expect(up).toHaveBeenCalledWith('p3');
    expect(down).toHaveBeenCalledWith('p2');
  });
});
