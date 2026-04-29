//
//
// ⚠️ AUTO-GENERATED — DO NOT EDIT
//
//

import submitOrder from "~/lib/actions/submit-order/action-handler.server";
import exampleAction from "~/lib/actions/example-action/action-handler.server";

export type ActionName = "submit-order" | "example-action";

const handlerMap: Record<ActionName, any> = {
  "submit-order": submitOrder,
  "example-action": exampleAction,
};

export default handlerMap;
