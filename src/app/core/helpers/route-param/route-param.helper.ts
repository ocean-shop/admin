import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

/** Route path param as a signal; must be called in an injection context. */
export const injectRouteParam = (name: string): Signal<string | null> => {
  const route = inject(ActivatedRoute);

  return toSignal(route.paramMap.pipe(map((params) => params.get(name)?.trim() || null)), {
    initialValue: route.snapshot?.paramMap?.get(name)?.trim() || null,
  });
};
