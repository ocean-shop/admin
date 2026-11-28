import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, Observable } from 'rxjs';

const readParam = (params: ParamMap | null | undefined, name: string): string | null =>
  params?.get(name)?.trim() || null;

const toParamSignal = (
  params$: Observable<ParamMap>,
  snapshot: ParamMap | null | undefined,
  name: string,
): Signal<string | null> =>
  toSignal(params$.pipe(map((params) => readParam(params, name))), {
    initialValue: readParam(snapshot, name),
  });

/** Route path param as a signal; must be called in an injection context. */
export const injectRouteParam = (name: string): Signal<string | null> => {
  const route = inject(ActivatedRoute);

  return toParamSignal(route.paramMap, route.snapshot?.paramMap, name);
};

/** Query string param as a signal (`?tab=products`); must be called in an injection context. */
export const injectQueryParam = (name: string): Signal<string | null> => {
  const route = inject(ActivatedRoute);

  return toParamSignal(route.queryParamMap, route.snapshot?.queryParamMap, name);
};
