import { mapValues } from "radash";
import {
  Contract,
  Procedure,
  ProcedureInputType,
  ProcedureOutputType,
} from "./Contract.js";

export type ProcedureImpl<P extends Procedure> = (
  input: ProcedureInputType<P>,
) => Promise<ProcedureOutputType<P>>;

export type ControllerImpl<API extends Contract> = {
  [K in keyof API]: ProcedureImpl<API[K]>;
};

type Controller<API extends Contract> = {
  [K in keyof API]: (
    input: ProcedureInputType<API[K]>,
  ) => Promise<ProcedureOutputType<API[K]>>;
};

export const createController = <API extends Contract<any, any>>(
  api: API,
  controller: ControllerImpl<API>,
): Controller<API> => {
  return mapValues(
    controller as any,
    (proc: ProcedureImpl<API[keyof API]>, key: string) => {
      return async (input: any) => {
        // validate input
        const params = api[key].input.safeParse(input);

        if (!params.success) {
          throw new Error("Invalid input");
        }

        // call the controller
        const result = await proc(input);

        // validate output
        const returnValue = api[key].output.safeParse(result);

        if (!returnValue.success) {
          throw new Error("Invalid output");
        }

        return returnValue.data;
      };
    },
  ) as any;
};
