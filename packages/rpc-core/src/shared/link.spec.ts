import { defineSchema } from '../schema/schemaHelpers';
import { createLinks } from './link';

describe('createLinks', () => {
  it('should support both types of links', () => {
    const schema = defineSchema({
      commands: {},
      queries: {},
      events: {},
    });

    const firstLink = {};
    const secondLink = jest.fn(() => ({ resolved: true }));

    const links = createLinks([firstLink, secondLink], schema);

    expect(secondLink).toHaveBeenCalledWith({ schema, linkIndex: 1 });
    expect(secondLink).toHaveBeenCalledTimes(1);
    expect(links).toEqual([
      {},
      {
        resolved: true,
      },
    ]);
  });
});
