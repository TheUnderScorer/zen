import { LinkFn, LinkParam } from './link.types';
import { OperationsSchema } from '../schema/schema.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLinks<L, T extends LinkParam<L>>(
  links: T[],
  schema: OperationsSchema
) {
  return links.map((link, index) => {
    if (typeof link === 'function') {
      return (link as LinkFn<T>)({ schema, linkIndex: index });
    }

    return link;
  }) as L[];
}
