import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { CartProvider } from "./cart-provider";
import { PlayerProvider } from "./player-provider";
import type { SessionUser } from "~/lib/auth/types";

interface ProvidersProps {
  children: ReactNode;
  user: SessionUser | null;
}

/** Wraps all client-side providers. Used in the root layout route. */
export function Providers({ children, user }: ProvidersProps) {
  return (
    <AuthProvider user={user}>
      <CartProvider>
        <PlayerProvider>{children}</PlayerProvider>
      </CartProvider>
    </AuthProvider>
  );
}
