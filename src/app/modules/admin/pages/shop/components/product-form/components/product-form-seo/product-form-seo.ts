import { Component, input } from '@angular/core';
import { ProductFormTree } from '../../models/product-form-tree.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Input } from '@ui/input/input';
import { Textarea } from '@ui/textarea/textarea';
import { ProductFormFieldIds } from '../../models/product-form-field-ids.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';

@Component({
  selector: 'app-product-form-seo',
  imports: [ProductFormCard, Checkbox, Input, Textarea],
  templateUrl: './product-form-seo.html',
  styleUrl: './product-form-seo.scss',
})
export class ProductFormSeo {
  readonly productForm = input.required<ProductFormTree>();
  readonly texts = input.required<ProductFormTexts>();
  readonly fieldIds = input.required<ProductFormFieldIds>();
}
