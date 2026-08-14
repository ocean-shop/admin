import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
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
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(
      convertToParamMap({ shopId: 'shop-1', productId: 'product-1' }),
    );
    mockProductsService = {
      getProductById: vi.fn().mockReturnValue(
        of({
          id: 'product-1',
          name: 'Coastal Shirt',
          type: ProductType.Simple,
          status: ProductStatus.Active,
          available: true,
          categories: [],
          attributes: [],
          tags: [],
          images: [],
          variations: [],
        }),
      ),
      updateProduct: vi.fn().mockReturnValue(of({ id: 'product-1' })),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsUpdate],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: ToasterService, useValue: mockToasterService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1', productId: 'product-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads product by current id', () => {
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
  });

  it('submits valid form and shows success toast', async () => {
    (component as any).productId.set('product-1');
    (component as any).productFormModel.set({
      name: 'Updated shirt',
      type: ProductType.Simple,
      description: 'Updated description',
      price: '45.10',
      oldPrice: '55.10',
      sku: 'UPDATED-1',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();
    await fixture.whenStable();

    expect(mockProductsService.updateProduct).toHaveBeenCalledWith('product-1', {
      name: 'Updated shirt',
      type: ProductType.Simple,
      description: 'Updated description',
      sku: 'UPDATED-1',
      status: ProductStatus.Draft,
      available: true,
      price: 45.1,
      oldPrice: 55.1,
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.UPDATE_SUCCESS_TITLE,
    );
  });

  it('does not submit when name is empty', () => {
    (component as any).productFormModel.set({
      name: '',
      type: ProductType.Simple,
      description: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();

    expect(mockProductsService.updateProduct).not.toHaveBeenCalled();
  });

  it('shows error toast when update fails', async () => {
    mockProductsService.updateProduct.mockReturnValueOnce(throwError(() => new Error('failed')));
    (component as any).productId.set('product-1');
    (component as any).productFormModel.set({
      name: 'Updated hat',
      type: ProductType.Variable,
      description: '',
      price: '',
      oldPrice: '',
      sku: 'SKU-2',
      status: ProductStatus.Active,
      available: false,
    });

    (component as any).onSubmit();
    await fixture.whenStable();

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_TITLE,
      PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_MESSAGE,
    );
  });
});
