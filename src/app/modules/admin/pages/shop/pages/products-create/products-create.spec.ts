import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_CREATE_TEXTS } from './constants/products-create.constants';
import { ProductsCreate } from './products-create';

describe('ProductsCreate', () => {
  let fixture: ComponentFixture<ProductsCreate>;
  let component: ProductsCreate;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    createProduct: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockProductsService = {
      createProduct: vi.fn().mockReturnValue(of({ id: 'product-1' })),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsCreate],
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

    fixture = TestBed.createComponent(ProductsCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders create page heading', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_CREATE_TEXTS.PAGE_TITLE,
    );
  });

  it('submits valid form and redirects to products page', () => {
    (component as any).productFormModel.set({
      name: 'Coastal Linen Shirt',
      type: ProductType.Simple,
      description: 'Lightweight beach shirt',
      price: '99.99',
      oldPrice: '129.99',
      sku: 'CSTL-SHRT-01',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();

    expect(mockProductsService.createProduct).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Coastal Linen Shirt',
      type: ProductType.Simple,
      description: 'Lightweight beach shirt',
      sku: 'CSTL-SHRT-01',
      status: ProductStatus.Draft,
      available: true,
      price: 99.99,
      oldPrice: 129.99,
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE,
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/shop', 'shop-1', 'products']);
  });

  it('does not submit when name is empty', () => {
    (component as any).productFormModel.set({
      name: '',
      type: ProductType.Variable,
      description: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();

    expect(mockProductsService.createProduct).not.toHaveBeenCalled();
  });

  it('shows error toast when create request fails', () => {
    mockProductsService.createProduct.mockReturnValueOnce(throwError(() => new Error('Failed')));
    (component as any).productFormModel.set({
      name: 'Coastal Hat',
      type: ProductType.Variable,
      description: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Archived,
      available: false,
    });

    (component as any).onSubmit();

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
