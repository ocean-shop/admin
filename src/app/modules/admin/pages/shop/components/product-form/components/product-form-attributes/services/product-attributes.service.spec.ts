import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import {
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_SEARCH_QUERY_LIMIT,
  PRODUCT_FORM_SEARCH_QUERY_PAGE,
} from '../../../constants/product-form.constants';
import { AttributesService } from '../../../../../pages/attributes/services/attributes.service';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductAttributesToastTexts } from '../models/product-attributes-toast-texts.model';
import { ProductAttributesService } from './product-attributes.service';

const waitForAsyncWork = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('ProductAttributesService', () => {
  let service: ProductAttributesService;
  let mockAttributesService: {
    getAttributes: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };

  const context: ProductFormEditorContext = {
    getShopId: () => 'shop-1',
    getProductId: () => 'product-1',
    isSidebarEnabled: () => true,
  };
  const toastTexts: ProductAttributesToastTexts = {
    ATTRIBUTE_ASSIGN_SUCCESS_TITLE: 'assigned',
    ATTRIBUTE_UNASSIGN_SUCCESS_TITLE: 'unassigned',
    ATTRIBUTE_ASSIGN_ERROR_TITLE: 'error title',
    ATTRIBUTE_ASSIGN_ERROR_MESSAGE: 'error message',
  };

  beforeEach(() => {
    mockAttributesService = {
      getAttributes: vi.fn().mockReturnValue(
        of({
          items: [{ id: 'attr-1', name: 'Size', value: 'XL' }],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      ),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductAttributesService,
        {
          provide: ProductsService,
          useValue: { toggleAttribute: vi.fn().mockReturnValue(of(void 0)) },
        },
        { provide: AttributesService, useValue: mockAttributesService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    });

    service = TestBed.inject(ProductAttributesService);
    service.configure(context, () => toastTexts);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads attribute search results with debounce', async () => {
    vi.useFakeTimers();
    service.onAttributeSearchChange('size');
    vi.advanceTimersByTime(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await waitForAsyncWork();

    expect(mockAttributesService.getAttributes).toHaveBeenCalledWith({
      page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
      limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
      shopId: 'shop-1',
      name: 'size',
    });
    expect(service.attributeSearchResults()).toEqual([{ id: 'attr-1', label: 'Size: XL' }]);
  });

  it('assigns attribute and shows success toast', async () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; attributeTypeId: string; assign: boolean },
        options?: { onSuccess?: () => void; onSettled?: () => void },
      ) => {
        options?.onSuccess?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleAttributeMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleAttributeMutation = { mutate: mutateSpy };
    service.attributeSearchResults.set([{ id: 'attr-1', label: 'Size: XL' }]);

    service.onAttributeAssign('attr-1');
    await waitForAsyncWork();

    expect(mutateSpy).toHaveBeenCalledWith(
      { productId: 'product-1', attributeTypeId: 'attr-1', assign: true },
      expect.any(Object),
    );
    expect(service.assignedAttributes()).toEqual([{ id: 'attr-1', label: 'Size: XL' }]);
    expect(mockToasterService.success).toHaveBeenCalledWith('assigned');
  });

  it('shows danger toast when assign fails', async () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; attributeTypeId: string; assign: boolean },
        options?: { onError?: () => void; onSettled?: () => void },
      ) => {
        options?.onError?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleAttributeMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleAttributeMutation = { mutate: mutateSpy };
    service.attributeSearchResults.set([{ id: 'attr-1', label: 'Size: XL' }]);

    service.onAttributeAssign('attr-1');
    await waitForAsyncWork();

    expect(mockToasterService.danger).toHaveBeenCalledWith('error title', 'error message');
    expect(service.isAttributeToggleLoading()).toBe(false);
  });

  it('unassigns attribute and shows success toast', async () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; attributeTypeId: string; assign: boolean },
        options?: { onSuccess?: () => void; onSettled?: () => void },
      ) => {
        options?.onSuccess?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleAttributeMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleAttributeMutation = { mutate: mutateSpy };
    service.assignedAttributes.set([{ id: 'attr-1', label: 'Size: XL' }]);

    service.onAttributeUnassign('attr-1');
    await waitForAsyncWork();

    expect(mutateSpy).toHaveBeenCalledWith(
      { productId: 'product-1', attributeTypeId: 'attr-1', assign: false },
      expect.any(Object),
    );
    expect(service.assignedAttributes()).toEqual([]);
    expect(mockToasterService.success).toHaveBeenCalledWith('unassigned');
  });
});
