//
//
// ⚠️ AUTO-GENERATED — DO NOT EDIT
//
//

import syncUserCart from "~/lib/actions/sync-user-cart/action-handler.server";
import getUserCart from "~/lib/actions/get-user-cart/action-handler.server";
import submitOrder from "~/lib/actions/submit-order/action-handler.server";
import exampleAction from "~/lib/actions/example-action/action-handler.server";

export type ActionName = "sync-user-cart" | "get-user-cart" | "submit-order" | "example-action";

const handlerMap: Record<ActionName, any> = {
  "sync-user-cart": syncUserCart,
  "get-user-cart": getUserCart,
  "submit-order": submitOrder,
  "example-action": exampleAction,
};

export default handlerMap;
