import {
  Contract,
  ProcedureInputType,
  ProcedureOutputType,
} from "../src/lib/Contract.js";
import z from "zod";

export const API = {
  test: {
    input: z.object({ foo: z.string() }),
    output: z.object({ qux: z.string() }),
    meta: { method: "GET", description: "Test endpoint", summary: "Test" },
  },
} satisfies Contract;

export type API = typeof API;

type InputType = ProcedureInputType<API["test"]>;
type OutputType = ProcedureOutputType<API["test"]>;
