import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // ── Auth routes (no layout — pure server redirects) ──────────────────────
  route("logout", "routes/logout.tsx"),
  route("auth/google", "routes/auth.google.tsx"),
  route("auth/google/callback", "routes/auth.google.callback.tsx"),

  // ── Main layout ───────────────────────────────────────────────────────────
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("shop", "routes/shop.tsx"),
    route("shop/:category", "routes/shop.$category.tsx"),
    route("product/:id", "routes/product.$id.tsx"),
    route("cart", "routes/cart.tsx"),
    route("checkout", "routes/checkout.tsx"),
    route("confirmation", "routes/confirmation.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("admin", "routes/admin.tsx"),
    route("sounds", "routes/sounds.tsx"),
    route("volunteer", "routes/volunteer.tsx"),
    route("login", "routes/login.tsx"),
    route("contact", "routes/contact.tsx"),
  ]),
] satisfies RouteConfig;
