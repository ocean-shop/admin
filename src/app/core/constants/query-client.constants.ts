import { DefaultOptions } from '@tanstack/angular-query-experimental';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;

export const QUERY_CLIENT_DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: 30 * SECOND_MS,
    gcTime: 5 * MINUTE_MS,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
};
