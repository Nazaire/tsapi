import { createController } from "../src/lib/Controller.js";
import { API } from "./contract.js";

const controller = createController(API, {
  test: async (input) => {
    return { qux: input.foo };
  },
});

const result = await controller.test({
  foo: "bar",
});
