import { Provider } from '@angular/core';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

export function provideTestQueryClient(): Provider[] {
  return provideTanStackQuery(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: 0,
        },
      },
    }),
  );
}
