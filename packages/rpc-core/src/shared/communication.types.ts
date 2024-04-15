export type Channel =
  | string
  | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Record<string, any>
  | Array<string | number>;
