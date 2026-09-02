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
import { ProductFormVariation } from '../../../models/product-form-variation.model';
import { ProductVariationsToastTexts } from '../models/product-variations-toast-texts.model';
import { ProductVariationsService } from './product-variations.service';

const waitForAsyncWork = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('ProductVariationsService', () => {
  let service: ProductVariationsService;
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
  const toastTexts: ProductVariationsToastTexts = {
    VARIATION_SAVE_SUCCESS_TITLE: 'saved',
    VARIATION_SAVE_ERROR_TITLE: 'save error',
    VARIATION_SAVE_ERROR_MESSAGE: 'save error message',
  };

  beforeEach(() => {
    mockAttributesService = {
      getAttributes: vi.fn().mockReturnValue(
        of({
          items: [{ id: 'attr-1', name: 'Color', value: 'Blue' }],
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
        ProductVariationsService,
        {
          provide: ProductsService,
          useValue: {
            createVariation: vi
              .fn()
              .mockReturnValue(of({ variations: [{ id: 'var-1', sku: 'SKU-1' }] })),
            updateVariation: vi
              .fn()
              .mockReturnValue(of({ variations: [{ id: 'var-1', sku: 'SKU-1' }] })),
          },
        },
        { provide: AttributesService, useValue: mockAttributesService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    });

    service = TestBed.inject(ProductVariationsService);
    service.configure(context, () => toastTexts);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a new variation when sidebar is enabled', () => {
    service.onVariationAdd();

    expect(service.variations().length).toBe(1);
    expect(service.variations()[0].localId).toContain('variation-local-');
  });

  it('loads variation attribute search results with debounce', async () => {
    vi.useFakeTimers();
    service.setVariations([
      {
        localId: 'local-1',
        id: null,
        title: '',
        name: '',
        price: '',
        oldPrice: '',
        sku: '',
        available: true,
        isMain: false,
        attributes: [],
        attributeSearchValue: '',
        attributeSearchResults: [],
        isAttributeSearchLoading: false,
        images: [],
        isSaving: false,
      },
    ]);

    service.onVariationAttributeSearchChange({ localId: 'local-1', value: 'col' });
    vi.advanceTimersByTime(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await waitForAsyncWork();

    expect(mockAttributesService.getAttributes).toHaveBeenCalledWith({
      page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
      limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
      shopId: 'shop-1',
      name: 'col',
    });
    expect(service.variations()[0].attributeSearchResults).toEqual([
      { id: 'attr-1', label: 'Color: Blue' },
    ]);
  });

  it('saves variation and sets persisted id on success', async () => {
    const variation: ProductFormVariation = {
      localId: 'local-1',
      id: null,
      title: 'Title',
      name: 'Name',
      price: '10.50',
      oldPrice: '',
      sku: 'SKU-1',
      available: true,
      isMain: false,
      attributes: [],
      attributeSearchValue: '',
      attributeSearchResults: [],
      isAttributeSearchLoading: false,
      images: [],
      isSaving: false,
    };
    service.setVariations([variation]);

    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; variation: ProductFormVariation },
        options?: {
          onSuccess?: (product: {
            variations?: ({ id?: string | null; sku?: string | null } | string)[];
          }) => void;
          onSettled?: () => void;
        },
      ) => {
        options?.onSuccess?.({ variations: [{ id: 'var-1', sku: 'SKU-1' }] });
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        saveVariationMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).saveVariationMutation = { mutate: mutateSpy };

    service.saveVariation({ localId: 'local-1' });
    await waitForAsyncWork();

    expect(mutateSpy).toHaveBeenCalledWith(
      { productId: 'product-1', variation },
      expect.any(Object),
    );
    expect(service.variations()[0].id).toBe('var-1');
    expect(mockToasterService.success).toHaveBeenCalledWith('saved');
    expect(service.variations()[0].isSaving).toBe(false);
  });

  it('shows danger toast when save fails', async () => {
    service.setVariations([
      {
        localId: 'local-1',
        id: null,
        title: '',
        name: 'Name',
        price: '12',
        oldPrice: '',
        sku: 'SKU-2',
        available: true,
        isMain: false,
        attributes: [],
        attributeSearchValue: '',
        attributeSearchResults: [],
        isAttributeSearchLoading: false,
        images: [],
        isSaving: false,
      },
    ]);

    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; variation: ProductFormVariation },
        options?: { onError?: () => void; onSettled?: () => void },
      ) => {
        options?.onError?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        saveVariationMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).saveVariationMutation = { mutate: mutateSpy };

    service.saveVariation({ localId: 'local-1' });
    await waitForAsyncWork();

    expect(mockToasterService.danger).toHaveBeenCalledWith('save error', 'save error message');
    expect(service.variations()[0].isSaving).toBe(false);
  });
});
