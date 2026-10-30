import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { createEmptyProductFormVariation } from '../../../../../../helpers/product-variation-mapping/product-variation-mapping.helper';
import { ProductsService } from '../../../../../../pages/products/services/products/products.service';
import {
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_TOAST_TEXTS,
  PRODUCT_FORM_VARIATION_LOCAL_ID_PREFIX,
} from '../../../../constants/product-form.constants';
import { ProductFormVariation } from '../../../../models/product-form-variation.model';
import { ProductFormSearchService } from '../../../../services/product-form-search/product-form-search.service';
import { ProductVariationsService } from './product-variations.service';

/** TanStack notifies mutation callbacks through scheduled macrotasks. */
const flushAsync = async (): Promise<void> => {
  for (let tick = 0; tick < 5; tick++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

const buildVariation = (overrides: Partial<ProductFormVariation> = {}): ProductFormVariation => ({
  ...createEmptyProductFormVariation('local-1'),
  ...overrides,
});

const image = (id: string) => ({ id, name: id, imageDataUrl: `data:image/png;${id}` });

describe('ProductVariationsService', () => {
  let service: ProductVariationsService;
  let productsService: {
    createVariation: ReturnType<typeof vi.fn>;
    updateVariation: ReturnType<typeof vi.fn>;
  };
  let searchAttributes: ReturnType<typeof vi.fn>;
  let toaster: { success: ReturnType<typeof vi.fn> };
  let sidebarEnabled: boolean;
  let shopId: string | null;

  beforeEach(() => {
    sidebarEnabled = true;
    shopId = 'shop-1';
    productsService = {
      createVariation: vi.fn().mockReturnValue(of({ variations: [{ id: 'var-1', sku: 'SKU-1' }] })),
      updateVariation: vi.fn().mockReturnValue(of({ variations: [{ id: 'var-1', sku: 'SKU-1' }] })),
    };
    searchAttributes = vi.fn().mockResolvedValue([{ id: 'attr-1', name: 'Color', value: 'Blue' }]);
    toaster = { success: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductVariationsService,
        { provide: ProductsService, useValue: productsService },
        { provide: ProductFormSearchService, useValue: { searchAttributes } },
        { provide: ToasterService, useValue: toaster },
      ],
    });

    service = TestBed.inject(ProductVariationsService);
    service.configure({
      getShopId: () => shopId,
      getProductId: () => 'product-1',
      isSidebarEnabled: () => sidebarEnabled,
    });
    // Runs the root effects that subscribe the mutation observers.
    TestBed.tick();
    service.setVariations([buildVariation()]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('add / remove / change', () => {
    it('adds an empty variation with a local id', () => {
      service.onVariationAdd();

      expect(service.variations()).toHaveLength(2);
      expect(service.variations()[1].localId).toContain(PRODUCT_FORM_VARIATION_LOCAL_ID_PREFIX);
    });

    it('ignores edits while the sidebar is disabled', () => {
      sidebarEnabled = false;

      service.onVariationAdd();
      service.onVariationChange({ localId: 'local-1', field: 'title', value: 'X' });
      service.onVariationRemove({ localId: 'local-1' });

      expect(service.variations()).toEqual([buildVariation()]);
    });

    it('changes a field of the variation', () => {
      service.onVariationChange({ localId: ' local-1 ', field: 'available', value: false });

      expect(service.variations()[0].available).toBe(false);
    });

    it('removes the variation and ignores blank ids', () => {
      service.onVariationRemove({ localId: '  ' });
      expect(service.variations()).toHaveLength(1);

      service.onVariationRemove({ localId: 'local-1' });
      expect(service.variations()).toEqual([]);
    });
  });

  describe('attribute search', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('debounces the search and maps results that are not assigned yet', async () => {
      service.onVariationAttributeSearchChange({ localId: 'local-1', value: 'col' });

      expect(service.variations()[0].attributeSearchValue).toBe('col');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(searchAttributes).toHaveBeenCalledWith('shop-1', 'col');
      expect(service.variations()[0].attributeSearchResults).toEqual([
        { id: 'attr-1', label: 'Color: Blue' },
      ]);
      expect(service.variations()[0].isAttributeSearchLoading).toBe(false);
    });

    it('clears the results for a blank search or a missing shop', async () => {
      service.setVariations([
        buildVariation({ attributeSearchResults: [{ id: 'x', label: 'X' }] }),
      ]);
      shopId = null;

      service.onVariationAttributeSearchChange({ localId: 'local-1', value: 'col' });
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(searchAttributes).not.toHaveBeenCalled();
      expect(service.variations()[0].attributeSearchResults).toEqual([]);
    });

    it('ignores blank local ids', () => {
      service.onVariationAttributeSearchChange({ localId: ' ', value: 'col' });

      expect(service.variations()[0].attributeSearchValue).toBe('');
    });

    it('falls back to empty results when the search fails', async () => {
      searchAttributes.mockRejectedValueOnce(new Error('boom'));

      service.onVariationAttributeSearchChange({ localId: 'local-1', value: 'col' });
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(service.variations()[0].attributeSearchResults).toEqual([]);
      expect(service.variations()[0].isAttributeSearchLoading).toBe(false);
    });

    it('drops results of a variation that was reset meanwhile', async () => {
      service.onVariationAttributeSearchChange({ localId: 'local-1', value: 'col' });
      service.setVariations([buildVariation()]);
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(searchAttributes).not.toHaveBeenCalled();
    });
  });

  describe('attributes', () => {
    it('assigns a search result to the variation', () => {
      service.setVariations([
        buildVariation({ attributeSearchResults: [{ id: 'attr-1', label: 'Color: Blue' }] }),
      ]);

      service.onVariationAttributeAssign({ localId: 'local-1', attributeId: ' attr-1 ' });

      expect(service.variations()[0].attributes.map((attribute) => attribute.id)).toEqual([
        'attr-1',
      ]);
    });

    it('unassigns an attribute and ignores blank attribute ids', () => {
      const attribute = {
        id: 'attr-1',
        attributeTypeId: 'attr-1',
        name: 'C',
        value: 'B',
        label: 'C: B',
      };
      service.setVariations([buildVariation({ attributes: [attribute] })]);

      service.onVariationAttributeUnassign({ localId: 'local-1', attributeId: ' ' });
      expect(service.variations()[0].attributes).toEqual([attribute]);

      service.onVariationAttributeUnassign({ localId: 'local-1', attributeId: 'attr-1' });
      expect(service.variations()[0].attributes).toEqual([]);
    });
  });

  describe('images', () => {
    beforeEach(() => {
      service.setVariations([buildVariation({ images: [image('a'), image('b')] })]);
    });

    it('appends allowed image files', async () => {
      const file = new File(['x'], 'photo.png', { type: 'image/png' });

      service.onVariationImageFilesSelected({ localId: 'local-1', files: [file] });
      await vi.waitFor(() => expect(service.variations()[0].images).toHaveLength(3));
    });

    it('ignores selections without allowed images', () => {
      const file = new File(['x'], 'notes.txt', { type: 'text/plain' });

      service.onVariationImageFilesSelected({ localId: 'local-1', files: [file] });

      expect(service.variations()[0].images).toHaveLength(2);
    });

    it('moves images up and down', () => {
      service.onVariationImageMoveDown({ localId: 'local-1', imageId: 'a' });
      expect(service.variations()[0].images.map((item) => item.id)).toEqual(['b', 'a']);

      service.onVariationImageMoveUp({ localId: 'local-1', imageId: 'a' });
      expect(service.variations()[0].images.map((item) => item.id)).toEqual(['a', 'b']);
    });

    it('removes an image and ignores blank image ids', () => {
      service.onVariationImageRemove({ localId: 'local-1', imageId: ' ' });
      service.onVariationImageMoveUp({ localId: 'local-1', imageId: ' ' });
      expect(service.variations()[0].images).toHaveLength(2);

      service.onVariationImageRemove({ localId: 'local-1', imageId: 'a' });
      expect(service.variations()[0].images.map((item) => item.id)).toEqual(['b']);
    });
  });

  describe('saveVariation', () => {
    it('creates a new variation and stores the persisted id', async () => {
      service.setVariations([buildVariation({ sku: 'SKU-1' })]);

      service.saveVariation({ localId: 'local-1' });
      expect(service.variations()[0].isSaving).toBe(true);
      await flushAsync();

      expect(productsService.createVariation).toHaveBeenCalledWith(
        'product-1',
        expect.objectContaining({ sku: 'SKU-1' }),
      );
      expect(service.variations()[0].id).toBe('var-1');
      expect(service.variations()[0].isSaving).toBe(false);
      expect(toaster.success).toHaveBeenCalledWith(
        PRODUCT_FORM_TOAST_TEXTS.VARIATION_SAVE_SUCCESS_TITLE,
      );
    });

    it('updates an existing variation', async () => {
      service.setVariations([buildVariation({ id: 'var-1' })]);

      service.saveVariation({ localId: 'local-1' });
      await flushAsync();

      expect(productsService.updateVariation).toHaveBeenCalledWith(
        'product-1',
        'var-1',
        expect.any(Object),
      );
    });

    it('resets the saving flag when the request fails', async () => {
      productsService.createVariation.mockReturnValueOnce(throwError(() => new Error('boom')));

      service.saveVariation({ localId: 'local-1' });
      await flushAsync();

      expect(service.variations()[0].isSaving).toBe(false);
      expect(service.variations()[0].id).toBeNull();
      expect(toaster.success).not.toHaveBeenCalled();
    });

    it('does nothing for unknown or already saving variations', () => {
      service.saveVariation({ localId: 'unknown' });
      service.setVariations([buildVariation({ isSaving: true })]);
      service.saveVariation({ localId: 'local-1' });

      expect(productsService.createVariation).not.toHaveBeenCalled();
    });
  });
});
