import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import {
  SHOP_DETAIL_SECTIONS,
  SHOP_DETAIL_SHOP_ID_PLACEHOLDER,
  SHOP_DETAIL_TEXTS,
} from './constants/shop-detail.constants';
import { ShopStatisticService } from './services/shop-statistic/shop-statistic.service';
import { ShopDetail } from './shop-detail';

describe('ShopDetail', () => {
  let fixture: ComponentFixture<ShopDetail>;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const getElement = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));

    await TestBed.configureTestingModule({
      imports: [ShopDetail],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...provideTestQueryClient(),
        {
          provide: ShopStatisticService,
          useValue: {
            getStatistic: vi.fn().mockReturnValue(of({ orders: [], products: [], users: [] })),
          },
        },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopDetail);
    await fixture.whenStable();
  });

  it('renders page title', () => {
    expect(getElement().textContent).toContain(SHOP_DETAIL_TEXTS.PAGE_TITLE);
  });

  it('renders a card with link for every section', () => {
    const links = Array.from(getElement().querySelectorAll('a.shop-detail-card-link'));

    expect(links.length).toBe(SHOP_DETAIL_SECTIONS.length);
    SHOP_DETAIL_SECTIONS.forEach((section, index) => {
      expect(links[index].getAttribute('href')).toBe(`/admin/shop/shop-1/${section.segment}`);
      expect(links[index].textContent).toContain(section.linkLabel);
    });
  });

  it('renders statistics only when shop id is present', async () => {
    expect(getElement().querySelector('app-shop-statistics')).toBeTruthy();

    paramMap$.next(convertToParamMap({}));
    await fixture.whenStable();

    expect(getElement().querySelector('app-shop-statistics')).toBeNull();
  });

  it('uses placeholder in routes when shop id is missing', async () => {
    paramMap$.next(convertToParamMap({}));
    await fixture.whenStable();

    const sections = (fixture.componentInstance as any).sections();
    expect(sections[0].route).toEqual([
      '/admin/shop',
      SHOP_DETAIL_SHOP_ID_PLACEHOLDER,
      SHOP_DETAIL_SECTIONS[0].segment,
    ]);
  });
});
