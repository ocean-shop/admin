import { Component, computed, effect, input, output, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Modal } from '@ui/modal/modal';
import {
  CATEGORIES_NAME_FIELD_ID,
  CATEGORIES_SLUG_FIELD_ID,
  CATEGORIES_TEXTS,
} from '../../constants/categories.constants';
import { CategoryFormData } from '../../models/category-form.model';
import { Category } from '../../models/category.model';
import { CategoryFormSubmitPayload } from '../../models/category-payload.model';

@Component({
  selector: 'app-category-form-modal',
  imports: [Modal, Input],
  templateUrl: './category-form-modal.html',
  styleUrl: './category-form-modal.scss',
})
export class CategoryFormModal {
  readonly isOpen = input.required<boolean>();
  readonly mode = input.required<'create' | 'update'>();
  readonly category = input<Category | null>(null);
  readonly parentCategory = input<Category | null>(null);
  readonly confirmLoading = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<CategoryFormSubmitPayload>();

  protected readonly nameFieldId = CATEGORIES_NAME_FIELD_ID;
  protected readonly slugFieldId = CATEGORIES_SLUG_FIELD_ID;
  protected readonly texts = CATEGORIES_TEXTS;

  protected readonly categoryFormModel = signal<CategoryFormData>({
    name: '',
    slug: '',
  });
  private readonly lastGeneratedSlug = signal('');

  protected readonly categoryForm = form(this.categoryFormModel, (schemaPath) => {
    required(schemaPath.name, { message: CATEGORIES_TEXTS.NAME_REQUIRED_MESSAGE });
    required(schemaPath.slug, { message: CATEGORIES_TEXTS.SLUG_REQUIRED_MESSAGE });
  });

  protected readonly title = computed(() =>
    this.mode() === 'create'
      ? this.parentCategory()
        ? CATEGORIES_TEXTS.MODAL_CREATE_CHILD_TITLE
        : CATEGORIES_TEXTS.MODAL_CREATE_ROOT_TITLE
      : CATEGORIES_TEXTS.MODAL_UPDATE_TITLE,
  );
  protected readonly confirmLabel = computed(() =>
    this.mode() === 'create'
      ? CATEGORIES_TEXTS.MODAL_CREATE_CONFIRM_LABEL
      : CATEGORIES_TEXTS.MODAL_UPDATE_CONFIRM_LABEL,
  );
  protected readonly isFormValid = computed(
    () => this.categoryForm.name().valid() && this.categoryForm.slug().valid(),
  );

  constructor() {
    effect(() => {
      const category = this.category();
      if (category) {
        this.prefillCategoryForm(category);
        return;
      }

      this.resetCategoryForm();
    });

    effect(() => {
      const name = this.categoryForm.name().value()?.trim() ?? '';
      const slug = this.categoryForm.slug().value()?.trim() ?? '';
      const generatedSlug = this.slugify(name);
      const previousGeneratedSlug = this.lastGeneratedSlug();

      if (!generatedSlug) {
        return;
      }

      if (!slug || (slug === previousGeneratedSlug && slug !== generatedSlug)) {
        this.updateSlug(generatedSlug);
      }
    });
  }

  protected onClose(): void {
    if (this.confirmLoading()) {
      return;
    }

    this.closed.emit();
  }

  protected onConfirm(): void {
    if (!this.isFormValid() || this.confirmLoading()) {
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.confirmed.emit(payload);
  }

  private buildPayload(): CategoryFormSubmitPayload | null {
    const name = this.categoryForm.name().value()?.trim() ?? '';
    const slug = this.categoryForm.slug().value()?.trim() ?? '';

    if (!name || !slug) {
      return null;
    }

    if (this.mode() === 'update') {
      const currentCategory = this.category();

      return {
        name,
        slug,
        ...(currentCategory?.parentId ? { parentId: currentCategory.parentId } : {}),
      };
    }

    const parentId = this.parentCategory()?.id;
    return {
      name,
      slug,
      ...(parentId ? { parentId } : {}),
    };
  }

  private prefillCategoryForm(category: Category): void {
    this.categoryFormModel.set({
      name: category.name,
      slug: category.slug,
    });
    this.lastGeneratedSlug.set(category.slug);
  }

  private resetCategoryForm(): void {
    this.categoryFormModel.set({
      name: '',
      slug: '',
    });
    this.lastGeneratedSlug.set('');
  }

  private updateSlug(slug: string): void {
    this.categoryFormModel.update((currentValue) => ({
      ...currentValue,
      slug,
    }));
    this.lastGeneratedSlug.set(slug);
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
