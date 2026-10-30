import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { injectRouteParam } from './route-param.helper';

describe('injectRouteParam', () => {
  let paramMap$: BehaviorSubject<ParamMap>;

  const setup = (snapshotParams: Record<string, string> | null): void => {
    paramMap$ = new BehaviorSubject(convertToParamMap(snapshotParams ?? {}));
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: snapshotParams ? { paramMap: convertToParamMap(snapshotParams) } : null,
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    });
  };

  it('starts from the snapshot value', () => {
    setup({ shopId: 'shop-1' });

    const shopId = TestBed.runInInjectionContext(() => injectRouteParam('shopId'));

    expect(shopId()).toBe('shop-1');
  });

  it('follows param changes and normalizes blank values to null', () => {
    setup({ shopId: 'shop-1' });
    const shopId = TestBed.runInInjectionContext(() => injectRouteParam('shopId'));

    paramMap$.next(convertToParamMap({ shopId: 'shop-2' }));
    expect(shopId()).toBe('shop-2');

    paramMap$.next(convertToParamMap({ shopId: '  ' }));
    expect(shopId()).toBeNull();

    paramMap$.next(convertToParamMap({}));
    expect(shopId()).toBeNull();
  });

  it('returns null when the snapshot is missing', () => {
    setup(null);

    const shopId = TestBed.runInInjectionContext(() => injectRouteParam('shopId'));

    expect(shopId()).toBeNull();
  });
});
