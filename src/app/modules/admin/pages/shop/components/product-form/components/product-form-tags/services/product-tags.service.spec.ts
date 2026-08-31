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
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { TagsService } from '../../../../../pages/tags/services/tags.service';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductTagsToastTexts } from '../models/product-tags-toast-texts.model';
import { ProductTagsService } from './product-tags.service';

const waitForAsyncWork = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('ProductTagsService', () => {
  let service: ProductTagsService;
  let mockTagsService: {
    getTags: ReturnType<typeof vi.fn>;
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
  const toastTexts: ProductTagsToastTexts = {
    TAG_ASSIGN_SUCCESS_TITLE: 'assigned',
    TAG_UNASSIGN_SUCCESS_TITLE: 'unassigned',
    TAG_ASSIGN_ERROR_TITLE: 'error title',
    TAG_ASSIGN_ERROR_MESSAGE: 'error message',
  };

  beforeEach(() => {
    mockTagsService = {
      getTags: vi.fn().mockReturnValue(
        of({
          items: [{ id: 'tag-1', name: 'Summer' }],
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
        ProductTagsService,
        { provide: ProductsService, useValue: { toggleTag: vi.fn().mockReturnValue(of(void 0)) } },
        { provide: TagsService, useValue: mockTagsService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    });

    service = TestBed.inject(ProductTagsService);
    service.configure(context, () => toastTexts);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads tag search results with debounce', async () => {
    vi.useFakeTimers();
    service.onTagSearchChange('sum');
    vi.advanceTimersByTime(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await waitForAsyncWork();

    expect(mockTagsService.getTags).toHaveBeenCalledWith({
      page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
      limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
      shopId: 'shop-1',
      name: 'sum',
    });
    expect(service.tagSearchResults()).toEqual([{ id: 'tag-1', label: 'Summer' }]);
  });

  it('assigns tag and shows success toast', async () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; tagId: string; assign: boolean },
        options?: { onSuccess?: () => void; onSettled?: () => void },
      ) => {
        options?.onSuccess?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleTagMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleTagMutation = { mutate: mutateSpy };
    service.tagSearchResults.set([{ id: 'tag-1', label: 'Summer' }]);

    service.onTagAssign('tag-1');
    await waitForAsyncWork();

    expect(mutateSpy).toHaveBeenCalledWith(
      { productId: 'product-1', tagId: 'tag-1', assign: true },
      expect.any(Object),
    );
    expect(service.assignedTags()).toEqual([{ id: 'tag-1', label: 'Summer' }]);
    expect(mockToasterService.success).toHaveBeenCalledWith('assigned');
  });

  it('shows danger toast when assign fails', async () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; tagId: string; assign: boolean },
        options?: { onError?: () => void; onSettled?: () => void },
      ) => {
        options?.onError?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleTagMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleTagMutation = { mutate: mutateSpy };
    service.tagSearchResults.set([{ id: 'tag-1', label: 'Summer' }]);

    service.onTagAssign('tag-1');
    await waitForAsyncWork();

    expect(mockToasterService.danger).toHaveBeenCalledWith('error title', 'error message');
    expect(service.isTagToggleLoading()).toBe(false);
  });

  it('unassigns tag and shows success toast', async () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; tagId: string; assign: boolean },
        options?: { onSuccess?: () => void; onSettled?: () => void },
      ) => {
        options?.onSuccess?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleTagMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleTagMutation = { mutate: mutateSpy };
    service.assignedTags.set([{ id: 'tag-1', label: 'Summer' }]);

    service.onTagUnassign('tag-1');
    await waitForAsyncWork();

    expect(mutateSpy).toHaveBeenCalledWith(
      { productId: 'product-1', tagId: 'tag-1', assign: false },
      expect.any(Object),
    );
    expect(service.assignedTags()).toEqual([]);
    expect(mockToasterService.success).toHaveBeenCalledWith('unassigned');
  });
});
