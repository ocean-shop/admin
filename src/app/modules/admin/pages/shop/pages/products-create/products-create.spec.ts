import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCT_FORM_DEFAULT_VALUE } from '../../components/product-form/constants/product-form.constants';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { CategoriesService } from '../categories/services/categories.service';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_CREATE_TEXTS } from './constants/products-create.constants';
import { ProductsCreate } from './products-create';

const buildFormValue = (overrides: Partial<ProductFormModel> = {}): ProductFormModel => ({
  ...PRODUCT_FORM_DEFAULT_VALUE,
  name: 'Coastal Linen Shirt',
  ...overrides,
});

describe('ProductsCreate', () => {
  let fixture: ComponentFixture<ProductsCreate>;
  let component: ProductsCreate;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
  };
  let toaster: { success: ReturnType<typeof vi.fn>; danger: ReturnType<typeof vi.fn> };

  const submit = async (): Promise<void> => {
    (component as any).onSubmit(new Event('submit'));
    await flushQueries(fixture);
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockProductsService = {
      createProduct: vi.fn().mockReturnValue(of({ id: 'product-1', slug: 'coastal-linen-shirt' })),
      updateProduct: vi.fn().mockReturnValue(of({ id: 'product-1' })),
    };
    toaster = { success: vi.fn(), danger: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProductsCreate],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: ProductsService, useValue: mockProductsService },
        {
          provide: CategoriesService,
          useValue: { getCategories: vi.fn().mockReturnValue(of([])) },
        },
        { provide: ToasterService, useValue: toaster },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsCreate);
    component = fixture.componentInstance;
    await flushQueries(fixture);
  });

  it('renders the page heading and keeps the sidebar disabled before creation', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_CREATE_TEXTS.PAGE_TITLE,
    );
    expect((component as any).isSidebarDisabled()).toBe(true);
  });

  it('creates the product, stores its id and the generated slug', async () => {
    (component as any).productFormModel.set(
      buildFormValue({ price: '99.99', sku: 'CSTL-SHRT-01', isPopular: true }),
    );

    await submit();

    expect(mockProductsService.createProduct).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Coastal Linen Shirt',
      type: ProductType.Simple,
      sku: 'CSTL-SHRT-01',
      status: ProductStatus.Draft,
      available: true,
      isPopular: true,
      isMainBanner: false,
      price: 99.99,
      metaTitle: null,
      metaDescription: null,
      canonicalUrl: null,
      noIndex: false,
    });
    expect(toaster.success).toHaveBeenCalledWith(PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE);
    expect((component as any).createdProductId()).toBe('product-1');
    expect((component as any).productFormModel().slug).toBe('coastal-linen-shirt');
    expect((component as any).isSidebarDisabled()).toBe(false);
  });

  it('updates the already created product on the next submit', async () => {
    (component as any).createdProductId.set('product-1');
    (component as any).productFormModel.set(buildFormValue({ name: 'Updated' }));

    await submit();

    expect(mockProductsService.createProduct).not.toHaveBeenCalled();
    expect(mockProductsService.updateProduct).toHaveBeenCalledWith(
      'product-1',
      expect.objectContaining({ name: 'Updated' }),
    );
    expect(toaster.success).toHaveBeenCalledWith(PRODUCTS_CREATE_TEXTS.UPDATE_SUCCESS_TITLE);
  });

  it('does not submit an invalid form', async () => {
    (component as any).productFormModel.set(buildFormValue({ name: '' }));

    await submit();

    expect(mockProductsService.createProduct).not.toHaveBeenCalled();
  });

  it('shows an error when the API returns no product id', async () => {
    mockProductsService.createProduct.mockReturnValueOnce(of({ id: null }));
    (component as any).productFormModel.set(buildFormValue());

    await submit();

    expect(toaster.danger).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
    );
    expect((component as any).createdProductId()).toBeNull();
  });

  it('leaves the error toast to the interceptor when the request fails', async () => {
    mockProductsService.createProduct.mockReturnValueOnce(throwError(() => new Error('Failed')));
    (component as any).productFormModel.set(buildFormValue());

    await submit();

    expect(toaster.success).not.toHaveBeenCalled();
    expect(toaster.danger).not.toHaveBeenCalled();
    expect((component as any).createdProductId()).toBeNull();
  });

  it('resets the created product when the shop changes', async () => {
    (component as any).createdProductId.set('product-1');

    paramMap$.next(convertToParamMap({ shopId: 'shop-2' }));
    await flushQueries(fixture);

    expect((component as any).shopId()).toBe('shop-2');
    expect((component as any).createdProductId()).toBeNull();
  });

  it('shows the warning and blocks submit without a shop', async () => {
    paramMap$.next(convertToParamMap({}));
    await flushQueries(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_CREATE_TEXTS.SHOP_ID_REQUIRED_MESSAGE,
    );
    expect((component as any).isSubmitDisabled()).toBe(true);
  });
});
