export type Merge<A, B> = A & B;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MergeAll<T extends any[]> = T extends [infer Head, ...infer Rest]
  ? Merge<Head, MergeAll<Rest>>
  : object;
