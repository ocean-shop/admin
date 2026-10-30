import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { CategoriesService } from '../categories/services/categories/categories.service';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products/products.service';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';
import { ProductsUpdate } from './products-update';

describe('ProductsUpdate', () => {
  let fixture: ComponentFixture<ProductsUpdate>;
  let component: ProductsUpdate;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    getProductById: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
  };
  let toaster: { success: ReturnType<typeof vi.fn> };

  const product = {
    id: 'product-1',
    name: 'Coastal Shirt',
    type: ProductType.Simple,
    status: ProductStatus.Active,
    price: 45.1,
    categories: ['cat-1'],
    tags: ['tag-1'],
  };

  const setup = async (params: Record<string, string>): Promise<void> => {
    paramMap$ = new BehaviorSubject(convertToParamMap(params));

    await TestBed.configureTestingModule({
      imports: [ProductsUpdate],
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
            snapshot: { paramMap: convertToParamMap(params) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsUpdate);
    component = fixture.componentInstance;
    await flushQueries(fixture);
  };

  const submit = async (): Promise<void> => {
    (component as any).onSubmit(new Event('submit'));
    await flushQueries(fixture);
  };

  beforeEach(() => {
    mockProductsService = {
      getProductById: vi.fn().mockReturnValue(of(product)),
      updateProduct: vi.fn().mockReturnValue(of(product)),
    };
    toaster = { success: vi.fn() };
  });

  describe('with a loaded product', () => {
    beforeEach(async () => {
      await setup({ shopId: 'shop-1', productId: 'product-1' });
    });

    it('loads the product into the form and the section seeds', () => {
      expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
      expect((component as any).productFormModel()).toMatchObject({
        name: 'Coastal Shirt',
        price: '45.10',
        status: ProductStatus.Active,
      });
      expect((component as any).formSeeds().categoryIds).toEqual(new Set(['cat-1']));
      expect((component as any).formSeeds().tags).toEqual([{ id: 'tag-1', label: 'tag-1' }]);
    });

    it('submits the edited form and refreshes the product', async () => {
      (component as any).productFormModel.update((value: object) => ({
        ...value,
        name: 'Updated shirt',
      }));

      await submit();

      expect(mockProductsService.updateProduct).toHaveBeenCalledWith(
        'product-1',
        expect.objectContaining({ name: 'Updated shirt', price: 45.1 }),
      );
      expect(toaster.success).toHaveBeenCalledWith(PRODUCTS_UPDATE_TEXTS.UPDATE_SUCCESS_TITLE);
      expect(mockProductsService.getProductById).toHaveBeenCalledTimes(2);
    });

    it('does not submit an invalid form', async () => {
      (component as any).productFormModel.update((value: object) => ({ ...value, name: '' }));

      await submit();

      expect(mockProductsService.updateProduct).not.toHaveBeenCalled();
    });

    it('does not toast success when the update fails', async () => {
      mockProductsService.updateProduct.mockReturnValueOnce(throwError(() => new Error('failed')));

      await submit();

      expect(toaster.success).not.toHaveBeenCalled();
    });
  });

  it('shows the not-found message when the product fails to load', async () => {
    mockProductsService.getProductById.mockReturnValue(throwError(() => new Error('404')));

    await setup({ shopId: 'shop-1', productId: 'missing' });

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_MESSAGE,
    );
    expect((component as any).isSubmitDisabled()).toBe(true);
  });

  it('shows the route warning and skips loading without a product id', async () => {
    await setup({ shopId: 'shop-1' });

    expect(mockProductsService.getProductById).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_UPDATE_TEXTS.SHOP_CONTEXT_REQUIRED_MESSAGE,
    );
  });
});
