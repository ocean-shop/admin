import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
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
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
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
          type: ProductType.Variable,
          description: 'Wind-friendly shirt',
          price: 99.5,
          oldPrice: 119.99,
          sku: 'SKU-1',
          status: ProductStatus.Active,
          available: false,
        }),
      ),
      updateProduct: vi.fn().mockReturnValue(of({ id: 'product-1' })),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsUpdate],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
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

  it('renders update page texts', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCTS_UPDATE_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(PRODUCTS_UPDATE_TEXTS.PAGE_DESCRIPTION);
  });

  it('loads product by id and prefills the form', () => {
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
    expect((component as any).productFormModel().name).toBe('Coastal Shirt');
    expect((component as any).productFormModel().type).toBe(ProductType.Variable);
    expect((component as any).productFormModel().price).toBe('99.50');
    expect((component as any).productFormModel().available).toBe(false);
  });

  it('submits valid form and redirects to products page', () => {
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
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/shop', 'shop-1', 'products']);
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

  it('shows error toast when update request fails', () => {
    mockProductsService.updateProduct.mockReturnValueOnce(throwError(() => new Error('Failed')));
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

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_TITLE,
      PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_MESSAGE,
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('shows load error toast when product request fails', async () => {
    mockProductsService.getProductById.mockReturnValueOnce(throwError(() => new Error('Missing')));
    paramMap$.next(convertToParamMap({ shopId: 'shop-1', productId: 'missing-product' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_TITLE,
      PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_MESSAGE,
    );
  });
});
