import z, { AnyZodObject, ZodUnion } from "zod";

export type SchemaObject = AnyZodObject;
export type SchemaObjectLike =
  | ZodUnion<[SchemaObject, ...SchemaObject[]]>
  | SchemaObject;

export type Procedure<
  Input extends SchemaObject = SchemaObject,
  Output extends SchemaObjectLike = SchemaObjectLike,
  Meta extends object | undefined = any,
> = Meta extends undefined
  ? {
      input: Input;
      output: Output;
      meta?: Meta;
    }
  : {
      input: Input;
      output: Output;
      meta: Meta;
    };

export type Contract<
  BaseInput extends SchemaObject = SchemaObject,
  BaseOutput extends SchemaObjectLike = SchemaObjectLike,
  MetaType extends object | undefined = any,
> = {
  [key: string]: Procedure<BaseInput, BaseOutput, MetaType>;
};

export type ProcedureInput<P extends Procedure> =
  P extends Procedure<infer I, any> ? I : never;
export type ProcedureReturn<P extends Procedure> =
  P extends Procedure<any, infer O> ? O : never;

export type ProcedureInputType<P extends Procedure<any, any>> = z.infer<
  P["input"]
>;
export type ProcedureOutputType<P extends Procedure<any, any>> = z.infer<
  P["output"]
>;

export type SimpleContract<MetaType extends object | undefined = object> =
  Contract<SchemaObject, SchemaObjectLike, MetaType>;
