//
//
// ⚠️ AUTO-GENERATED — DO NOT EDIT
//
//

import syncUserCart from "~/lib/actions/sync-user-cart/action-handler.server";
import getUserCart from "~/lib/actions/get-user-cart/action-handler.server";
import mergeGuestCart from "~/lib/actions/merge-guest-cart/action-handler.server";
import submitOrder from "~/lib/actions/submit-order/action-handler.server";
import exampleAction from "~/lib/actions/example-action/action-handler.server";

export type ActionName = "sync-user-cart" | "get-user-cart" | "merge-guest-cart" | "submit-order" | "example-action";

const handlerMap: Record<ActionName, any> = {
  "sync-user-cart": syncUserCart,
  "get-user-cart": getUserCart,
  "merge-guest-cart": mergeGuestCart,
  "submit-order": submitOrder,
  "example-action": exampleAction,
};

export default handlerMap;
