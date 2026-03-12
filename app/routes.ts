import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // ── Standalone routes (no main layout) ───────────────────────────────────
  route("logout", "routes/logout.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/google", "routes/auth.google.tsx"),
  route("auth/google/callback", "routes/auth.google.callback.tsx"),
  route("*", "routes/$.tsx"),

  // ── Main layout ───────────────────────────────────────────────────────────
  layout("routes/_layout.tsx", [
    index("routes/_layout.home.tsx"),
    route("admin", "routes/_layout.admin.tsx"),
    route("shop", "routes/_layout.shop.tsx"),
    route("shop/:category", "routes/_layout.shop.$category.tsx"),
    route("product/:id", "routes/_layout.product.$id.tsx"),
    route("cart", "routes/_layout.cart.tsx"),
    route("checkout", "routes/_layout.checkout.tsx"),
    route("confirmation", "routes/_layout.confirmation.tsx"),
    route("dashboard", "routes/_layout.dashboard.tsx"),
    route("profile", "routes/_layout.profile.tsx"),
    route("contact", "routes/_layout.contact.tsx"),
  ]),
] satisfies RouteConfig;
