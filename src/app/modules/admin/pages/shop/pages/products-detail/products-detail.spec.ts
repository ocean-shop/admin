import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCTS_TEXTS } from '../products/constants/products.constants';
import { ProductApiItem } from '../products/models/product.model';
import { ProductsService } from '../products/services/products/products.service';
import { PRODUCTS_DETAIL_TEXTS } from './constants/products-detail.constants';
import { ProductsDetail } from './products-detail';

describe('ProductsDetail', () => {
  let fixture: ComponentFixture<ProductsDetail>;
  let component: ProductsDetail;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    getProductById: ReturnType<typeof vi.fn>;
    getRelatedProducts: ReturnType<typeof vi.fn>;
  };
  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const simpleProduct: ProductApiItem = {
    id: 'product-1',
    name: 'Nothing Phone 1',
    sku: '17',
    slug: 'nothing-phone-1',
    type: 'simple',
    status: 'active',
    price: 250,
    isPopular: true,
    description: 'Great phone',
    tags: [{ id: 't-1', name: '5G' }],
  };

  const setup = async (
    params: Record<string, string>,
    product: ProductApiItem = simpleProduct,
  ): Promise<void> => {
    paramMap$ = new BehaviorSubject(convertToParamMap(params));
    mockProductsService = {
      getProductById: vi.fn().mockReturnValue(of(product)),
      getRelatedProducts: vi
        .fn()
        .mockReturnValue(of([{ id: 'product-2', title: 'Tablet', price: 400 }])),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsDetail],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...provideTestQueryClient(),
        { provide: ProductsService, useValue: mockProductsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(params) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsDetail);
    component = fixture.componentInstance;
    await flushQueries(fixture);
  };

  describe('with a simple product', () => {
    beforeEach(async () => {
      await setup({ shopId: 'shop-1', productId: 'product-1' });
    });

    it('loads the product and its related products by route id', () => {
      expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
      expect(mockProductsService.getRelatedProducts).toHaveBeenCalledWith('product-1');
    });

    it('shows the product name, badges and subtitle in the header', () => {
      const title = element().querySelector('.page-header-title');

      expect((component as any).pageTitle()).toBe('Nothing Phone 1');
      expect(title?.textContent).toContain('Nothing Phone 1');
      expect(title?.querySelectorAll('app-badge')).toHaveLength(3);
      expect(title?.textContent).toContain(PRODUCTS_DETAIL_TEXTS.POPULAR_BADGE);
      expect((component as any).pageSubtitle()).toContain('/nothing-phone-1');
      expect((component as any).breadcrumbItems().at(-2).label).toBe(PRODUCTS_TEXTS.PAGE_TITLE);
      expect((component as any).breadcrumbItems().at(-1).label).toBe('Nothing Phone 1');
    });

    it('renders the overview, description, pricing and side sections', () => {
      const text = element().textContent ?? '';

      expect(element().querySelector('app-product-detail-gallery')).toBeTruthy();
      expect(element().querySelector('.products-detail-price-current')?.textContent).toContain(
        '250.00',
      );
      expect(element().querySelector('.products-detail-price-old')).toBeNull();
      expect(text).toContain('Great phone');
      expect(text).toContain(PRODUCTS_DETAIL_TEXTS.PRICING_TITLE);
      expect(text).not.toContain(PRODUCTS_DETAIL_TEXTS.VARIATIONS_TITLE);
      expect(text).toContain('5G');
      expect(text).toContain(PRODUCTS_DETAIL_TEXTS.CATEGORIES_EMPTY);
      expect(text).toContain(`${PRODUCTS_DETAIL_TEXTS.SEO_MISSING_PREFIX} 2`);
    });

    it('lists related products as links', () => {
      expect((component as any).relatedCount()).toBe('1');
      expect(element().querySelector('.related-list-link')?.getAttribute('href')).toBe(
        '/admin/shop/shop-1/products/product-2',
      );
    });

    it('navigates to the update page on edit', () => {
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      (component as any).onEdit();

      expect(navigateSpy).toHaveBeenCalledWith([
        '/admin/shop',
        'shop-1',
        'products',
        'product-1',
        'update',
      ]);
    });
  });

  it('renders the variations table for a variable product', async () => {
    await setup(
      { shopId: 'shop-1', productId: 'product-1' },
      {
        ...simpleProduct,
        type: 'variable',
        description: null,
        metaTitle: 'T',
        metaDescription: 'D',
        variations: [
          { id: 'v-1', title: 'White', price: 250, available: true },
          { id: 'v-2', title: 'Black', price: 299, available: false },
        ],
      },
    );
    const text = element().textContent ?? '';

    expect((component as any).isVariable()).toBe(true);
    expect((component as any).variationsCount()).toBe('2');
    expect(element().querySelectorAll('tr.table-row')).toHaveLength(2);
    expect(text).toContain(`${PRODUCTS_DETAIL_TEXTS.PRICE_FROM_PREFIX} 250.00`);
    expect(text).toContain(PRODUCTS_DETAIL_TEXTS.DESCRIPTION_EMPTY);
    expect(text).not.toContain(PRODUCTS_DETAIL_TEXTS.PRICING_TITLE);
    expect((component as any).missingSeoFieldsLabel()).toBe('');
  });

  it('shows an error when the product fails to load', async () => {
    TestBed.overrideProvider(ProductsService, {
      useValue: {
        getProductById: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
        getRelatedProducts: vi.fn().mockReturnValue(of([])),
      },
    });
    await setup({ shopId: 'shop-1', productId: 'product-1' });
    await flushQueries(fixture);

    expect((component as any).hasError()).toBe(true);
    expect(element().textContent).toContain(PRODUCTS_DETAIL_TEXTS.PRODUCT_LOAD_ERROR);
  });

  describe('without a product id', () => {
    beforeEach(async () => {
      await setup({ shopId: 'shop-1' });
    });

    it('does not load anything and asks for a valid route', () => {
      expect(mockProductsService.getProductById).not.toHaveBeenCalled();
      expect(mockProductsService.getRelatedProducts).not.toHaveBeenCalled();
      expect(element().textContent).toContain(PRODUCTS_DETAIL_TEXTS.SHOP_CONTEXT_REQUIRED_MESSAGE);
      expect((component as any).pageTitle()).toBe(PRODUCTS_DETAIL_TEXTS.PAGE_TITLE);
      expect((component as any).statusTone()).toBe('neutral');
      expect((component as any).price()).toBeNull();
    });

    it('ignores edit', () => {
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

      (component as any).onEdit();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
