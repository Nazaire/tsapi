import { z } from "zod";
import { OpenAPIContract } from "../src/lib/OpenAPI.js";
import { createController } from "@nazaire/tsapi-core/src/lib/Controller.js";
import {
  ProcedureInputType,
  ProcedureOutputType,
} from "@nazaire/tsapi-core/src/lib/Contract.js";

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

export type API = typeof SCHEMA;

export type InputType = ProcedureInputType<API["test"]>;
export type OutputType = ProcedureOutputType<API["test"]>;

const controller = createController(SCHEMA, {
  test: async ({ query }): Promise<ProcedureOutputType<API["test"]>> => {
    return { status: 400, body: { error: query.foo } } as const;
  },
});

const result = await controller.test({
  query: {
    foo: "bar",
  },
});
