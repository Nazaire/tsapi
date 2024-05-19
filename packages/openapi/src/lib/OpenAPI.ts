import { ZodObject, ZodType, ZodUnion, AnyZodObject, ZodUndefined } from "zod";
import { Contract } from "@nazaire/tsapi-core/src/lib/Contract.js";

export type OpenAPIInput = ZodObject<{
  query: AnyZodObject | ZodUndefined;
  body: AnyZodObject | ZodUndefined;
  headers: AnyZodObject | ZodUndefined;
}>;

export type OpenAPIResponse = ZodObject<{
  status: ZodType<number>;
  body: AnyZodObject;
}>;

export type OpenAPIMeta = {
  method: string;
  summary: string;
  description: string;

  // additional OpenAPI properties ...
};

export type OpenAPIOutput =
  | OpenAPIResponse
  | ZodUnion<[OpenAPIResponse, ...OpenAPIResponse[]]>;

export type OpenAPIContract = Contract<
  OpenAPIInput,
  OpenAPIOutput,
  OpenAPIMeta
>;
