import { useMemo } from 'react';

export function getQueryKey(key: string, variables?: unknown) {
  return variables ? [key, variables] : [key];
}

export function useQueryKey(
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any
) {
  return useMemo(() => getQueryKey(query, variables), [query, variables]);
}
