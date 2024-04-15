import { defineRpcSchema, mergeSchemas, operation } from './schemaHelpers';
import { testPostSchema, testUserSchema } from '@theunderscorer/rpc-test-utils';

describe('mergeSchemas', () => {
  it('should merge schemas multiple times', () => {
    const firstMergedSchema = mergeSchemas(testUserSchema, testPostSchema);

    const schema = defineRpcSchema({
      events: {},
      queries: {},
      commands: {
        testCommand: operation.command,
      },
    });

    const fullSchema = mergeSchemas(firstMergedSchema, schema);

    expect(fullSchema).toMatchInlineSnapshot(`
      {
        "commands": {
          "createPost": RpcOperationDefinition {
            "kind": "command",
            "meta": undefined,
            "name": "createPost",
            "payload": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
            "result": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
          },
          "createUser": RpcOperationDefinition {
            "kind": "command",
            "meta": undefined,
            "name": "createUser",
            "payload": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
            "result": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
          },
          "testCommand": RpcOperationDefinition {
            "kind": "command",
            "meta": undefined,
            "name": "testCommand",
            "payload": undefined,
            "result": undefined,
          },
        },
        "events": {
          "postCreated": RpcOperationDefinition {
            "kind": "event",
            "meta": undefined,
            "name": "postCreated",
            "payload": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
            "result": undefined,
          },
          "userCreated": RpcOperationDefinition {
            "kind": "event",
            "meta": undefined,
            "name": "userCreated",
            "payload": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
            "result": undefined,
          },
        },
        "queries": {
          "getPost": RpcOperationDefinition {
            "kind": "query",
            "meta": undefined,
            "name": "getPost",
            "payload": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
            "result": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
          },
          "getUser": RpcOperationDefinition {
            "kind": "query",
            "meta": undefined,
            "name": "getUser",
            "payload": ZodObject {
              "_cached": null,
              "_def": {
                "catchall": ZodNever {
                  "_def": {
                    "typeName": "ZodNever",
                  },
                  "and": [Function],
                  "array": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "shape": [Function],
                "typeName": "ZodObject",
                "unknownKeys": "strip",
              },
              "and": [Function],
              "array": [Function],
              "augment": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nonstrict": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
            "result": ZodOptional {
              "_def": {
                "description": undefined,
                "errorMap": [Function],
                "innerType": ZodObject {
                  "_cached": null,
                  "_def": {
                    "catchall": ZodNever {
                      "_def": {
                        "typeName": "ZodNever",
                      },
                      "and": [Function],
                      "array": [Function],
                      "brand": [Function],
                      "catch": [Function],
                      "default": [Function],
                      "describe": [Function],
                      "isNullable": [Function],
                      "isOptional": [Function],
                      "nullable": [Function],
                      "nullish": [Function],
                      "optional": [Function],
                      "or": [Function],
                      "parse": [Function],
                      "parseAsync": [Function],
                      "pipe": [Function],
                      "promise": [Function],
                      "readonly": [Function],
                      "refine": [Function],
                      "refinement": [Function],
                      "safeParse": [Function],
                      "safeParseAsync": [Function],
                      "spa": [Function],
                      "superRefine": [Function],
                      "transform": [Function],
                    },
                    "shape": [Function],
                    "typeName": "ZodObject",
                    "unknownKeys": "strip",
                  },
                  "and": [Function],
                  "array": [Function],
                  "augment": [Function],
                  "brand": [Function],
                  "catch": [Function],
                  "default": [Function],
                  "describe": [Function],
                  "isNullable": [Function],
                  "isOptional": [Function],
                  "nonstrict": [Function],
                  "nullable": [Function],
                  "nullish": [Function],
                  "optional": [Function],
                  "or": [Function],
                  "parse": [Function],
                  "parseAsync": [Function],
                  "pipe": [Function],
                  "promise": [Function],
                  "readonly": [Function],
                  "refine": [Function],
                  "refinement": [Function],
                  "safeParse": [Function],
                  "safeParseAsync": [Function],
                  "spa": [Function],
                  "superRefine": [Function],
                  "transform": [Function],
                },
                "typeName": "ZodOptional",
              },
              "and": [Function],
              "array": [Function],
              "brand": [Function],
              "catch": [Function],
              "default": [Function],
              "describe": [Function],
              "isNullable": [Function],
              "isOptional": [Function],
              "nullable": [Function],
              "nullish": [Function],
              "optional": [Function],
              "or": [Function],
              "parse": [Function],
              "parseAsync": [Function],
              "pipe": [Function],
              "promise": [Function],
              "readonly": [Function],
              "refine": [Function],
              "refinement": [Function],
              "safeParse": [Function],
              "safeParseAsync": [Function],
              "spa": [Function],
              "superRefine": [Function],
              "transform": [Function],
            },
          },
        },
      }
    `);
  });
});
