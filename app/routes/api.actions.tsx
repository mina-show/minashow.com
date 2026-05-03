/**
 * Resource route for the formal action system.
 *
 * Lets actions be invoked from any page (e.g. CartProvider on every route)
 * without requiring each leaf route to wire its own action handler.
 */
export { action_handler as action } from "~/lib/actions/_core/action-runner.server";
