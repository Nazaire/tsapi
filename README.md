# tsapi - Proof of concept / highly experimental

This package is a work in progress.

`tsapi` is an abstract TypeScript API framework to help with separation and schema validation, compatible with any form of API.

It can be used to defined API schemas, validate incoming data, and generate API documentation compatible with any API framework.

It's not only intended to model REST APIs, but also any other form of API, such as GraphQL, internal services (like an API for async job queues), or even a simple CLI. Forcing consumers of the API to confirm to the schema leveraging TypeScript's type system, and validating procedure calls and responses to ensure the consumer and the provider conform to the agreed upon contact.

## How to use

Firstly, you want to define the contract.

```typescript
import { z } from "zod";
import { Contract, ProcedureInputType, ProcedureOutputType } from "tsapi";

// Define the contract
export const MyAPI = {
  // define a procedure called `test`
  test: {
    // the input schema
    input: z.object({ foo: z.string() }),
    // the output schema
    output: z.object({ bar: z.string() }),
  },
  // important! this line is required to satisfy the Contract type
} satisfies Contract;

export type MyAPI = typeof MyAPI;

// MyAPI is now a strictly typed schema, and a set of zod schemas for input and output validation.

// If you need individual types for the input and output signatures, you can use the `Input` and `Output` types.

/**
 * Input type for the `test` procedure.
 * { foo: string }
 */
type TestInput = ProcedureInputType<MyAPI["test"]>;

/**
 * Output type for the `test` procedure.
 * { bar: string }
 */
type TestOutput = ProcedureOutputType<MyAPI["test"]>;
```

Then, you can build off the contract to create a controller which implements the procedures for the contract.

```typescript
import { createController } from "tsapi";
// Import the contract
import { MyAPI } from "./contract.js";

// Define the controller
const controller = createController(API, {
  // Implement the `test` procedure
  test: async (input) => {
    // input is automatically typed as { foo: string }
    const foo = input.foo; // string

    // return value is typed as { bar: string }
    return { bar: input.foo };
  },
});

// The controller can now be invoked as follows:

// Invoke the `test` procedure
const result = await controller.test(
  // input is automatically typed as { foo: string }
  { foo: "hello" },
);

// result is automatically typed as { bar: string }
console.log(result.bar); // hello
```

Note, for a better description of type issues you can do this:

```typescript

type TestOutput = ProcedureOutputType<API["test"]>;

const controller = createController(API, {
  // Defining the return type of the procedure explicitly results in better type checking and more descriptive error messages.
  test: async (input): Promise<TestOutput> = {
    // ...
  },
});
```

And that's it! You now have a strictly typed API schema, and a controller that implements the procedures for the schema.

The controller implementation is just simply a set of functions that conform to the contract and apply automatic type checking and validation.

You can now use the controller to implement the API in any form you like, such as a REST API, a GraphQL API, or even a CLI.

## Extending support with packages

The `tsapi/core` package is designed to be a foundation that is composible and extensible. We intend to provide a set of plugins that can be used to extend the functionality of the core package.

- `tsapi/core` - The core package, providing the basic API schema and controller functionality.
- `tsapi/express` - A utility that can create an Express.js router from the API schema.
- `tsapi/openapi` - A utility to generate OpenAPI documentation from the API schema.

The core package is designed to be extensible, allowing plugins to extend the `Contract` type. For example to add OpenAPI support, you can extend the `Contract` type to include OpenAPI metadata and conform to the OpenAPI schema.

```typescript
import { ZodObject, ZodType, ZodUnion, AnyZodObject } from "zod";
import { Contract } from "@nazaire/tsapi-core/src/lib/Contract.js";

// Define the base InputType for a procedure
export type OpenAPIInput = ZodObject<{
  query: AnyZodObject;
  body: AnyZodObject;
  headers: AnyZodObject;
}>;

// Define the base OutputType for a procedure
export type OpenAPIResponse = ZodObject<{
  status: ZodType<number>;
  body: AnyZodObject;
}>;
export type OpenAPIOutput =
  | OpenAPIResponse
  | ZodUnion<[OpenAPIResponse, ...OpenAPIResponse[]]>;

// Define the required metadata for a procedure
export type OpenAPIMeta = {
  method: string;
  summary: string;
  description: string;

  // additional OpenAPI properties ...
};

// Define the type for an OpenAPI contract
export type OpenAPIContract = Contract<
  OpenAPIInput,
  OpenAPIOutput,
  // Define the metadata type for the contract
  OpenAPIMeta
>;

// now consumers can use the OpenAPIContract type to define an API schema that conforms to the OpenAPI schema.

const SCHEMA = {
  test: {
    input: z.object({
      query: z.object({
        foo: z.string(),
      }),
      body: z.undefined(),
      headers: z.undefined(),
    }),
    output: z.union([
      z.object({ status: z.literal(200), body: z.object({ qux: z.string() }) }),
      z.object({
        status: z.literal(400),
        body: z.object({ error: z.string() }),
      }),
    ]),
    meta: {
      method: "GET",
      description: "Test endpoint",
      summary: "Test",
    },
  },
} satisfies OpenAPIContract;
```
