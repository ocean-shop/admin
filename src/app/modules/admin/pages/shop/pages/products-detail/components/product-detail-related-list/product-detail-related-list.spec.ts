import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PRODUCTS_DETAIL_TEXTS } from '../../constants/products-detail.constants';
import { ProductDetailRelatedItem } from '../../models/product-detail-related-item.model';
import { ProductDetailRelatedList } from './product-detail-related-list';

describe('ProductDetailRelatedList', () => {
  let fixture: ComponentFixture<ProductDetailRelatedList>;
  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const items: ProductDetailRelatedItem[] = [
    {
      id: 'p-2',
      title: 'Iphone 14',
      price: 'від 345.00',
      image: 'https://cdn/iphone.png',
      href: '/admin/shop/shop-1/products/p-2',
    },
    {
      id: 'p-3',
      title: 'Lenovo D1',
      price: '670.00',
      image: null,
      href: '/admin/shop/shop-1/products/p-3',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailRelatedList],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailRelatedList);
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
  });

  it('renders numbered links to each related product', () => {
    const links = element().querySelectorAll('.related-list-link');

    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('/admin/shop/shop-1/products/p-2');
    expect(links[0].querySelector('.related-list-position')?.textContent).toContain('1');
    expect(links[1].querySelector('.related-list-title')?.textContent).toContain('Lenovo D1');
    expect(links[1].querySelector('.related-list-price')?.textContent).toContain('670.00');
    expect(element().textContent).toContain(PRODUCTS_DETAIL_TEXTS.RELATED_HINT);
  });

  it('shows the image or a placeholder thumbnail', () => {
    expect(element().querySelectorAll('img.related-list-thumb')).toHaveLength(1);
    expect(element().querySelectorAll('.related-list-thumb')).toHaveLength(2);
  });

  it('shows the empty text when there are no related products', async () => {
    fixture.componentRef.setInput('items', []);
    await fixture.whenStable();

    expect(element().querySelector('.related-list')).toBeNull();
    expect(element().textContent).toContain(PRODUCTS_DETAIL_TEXTS.RELATED_EMPTY);
  });
});
