import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import { useAuth } from "./auth-provider";
import { useAction } from "~/hooks/use-action";
import { syncUserCartDefinition } from "~/lib/actions/sync-user-cart/action-definition";
import { getUserCartDefinition } from "~/lib/actions/get-user-cart/action-definition";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  /** Sum of price × quantity for all items */
  total: number;
  /** Total number of individual units */
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "minashow_cart";
const ACTIONS_ROUTE = "/api/actions";
/** Idle window before persisting cart edits to the server. */
const SYNC_DEBOUNCE_MS = 800;

/**
 * Cart state machine.
 *
 * - **Guest:** items live in localStorage. Edits mirror to localStorage.
 * - **Signed-in:** items live on the server. On every auth transition into a
 *   signed-in state we fetch the server cart and replace local state. Edits
 *   are debounced-synced back to the server. localStorage is NOT used for
 *   signed-in users so prior session data can't bleed into the wire.
 * - **Sign-in transition:** the guest cart is **discarded** (no merge). The
 *   user's existing server cart wins.
 * - **Sign-out:** local items + localStorage are cleared; server cart is
 *   preserved on the account for next sign-in.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  // Admins never have a cart; treat them as cart-less for sync purposes too.
  const userId = user && !isAdmin ? user.id : null;

  const [items, setItems] = useState<CartItem[]>([]);
  /** True after we've read localStorage (guest) or fetched the server cart (signed-in). */
  const [isHydrated, setIsHydrated] = useState(false);
  /** True once the cart is reconciled with the canonical source for the current identity. */
  const [serverSynced, setServerSynced] = useState(false);

  /** Previous user id, used to detect identity transitions. `undefined` = pre-mount. */
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  /**
   * When set, the next [items] sync effect will skip its server write. Used after we
   * load the canonical server cart so we don't immediately push it back unchanged.
   */
  const skipNextServerSyncRef = useRef(false);

  const { submit: submitSync } = useAction(syncUserCartDefinition, {
    route: ACTIONS_ROUTE,
  });
  const { submit: submitGetUserCart } = useAction(getUserCartDefinition, {
    route: ACTIONS_ROUTE,
    onSuccess: (data) => {
      skipNextServerSyncRef.current = true;
      setItems(data.items);
      setServerSynced(true);
      setIsHydrated(true);
    },
  });

  // ── Hydrate from localStorage on mount (guests only — see auth effect below) ─
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // Corrupt data — start fresh
    }
    // If a signed-in session is active, the auth effect below will overwrite
    // these items with the server cart and re-set isHydrated. For guests, this
    // is the final hydration state.
    setIsHydrated(true);
  }, []);

  // ── Mirror items to localStorage — guests only ─────────────────────────────
  // Signed-in users' carts live on the server; keeping a local copy would
  // re-introduce the doubling bug if the local copy ever got sent back up.
  useEffect(() => {
    if (!isHydrated) return;
    if (userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated, userId]);

  // ── React to identity transitions (initial mount, login, logout, switch) ───
  useEffect(() => {
    if (!isHydrated) return;

    const previousUserId = lastUserIdRef.current;
    lastUserIdRef.current = userId;

    // No-op if the identity didn't actually change.
    if (previousUserId === userId) return;

    if (userId) {
      // Initial mount with active session, fresh login, or account switch.
      // Either way: fetch the server cart and replace local state. Guest cart
      // (if any) is intentionally discarded. localStorage is wiped so it
      // can't leak server data into a later guest session.
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      setServerSynced(false);
      submitGetUserCart({});
      return;
    }

    // userId is null. Only fire the logout cleanup if we previously had one;
    // anonymous-from-start sessions are already in the right state.
    if (previousUserId) {
      skipNextServerSyncRef.current = true;
      setItems([]);
      setServerSynced(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    // We intentionally exclude `items` and `submitGetUserCart` from deps:
    // this effect should run only on identity transitions, not on cart edits
    // or fetcher-reference churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isHydrated]);

  // ── Debounced server sync on cart edits (signed-in users only) ─────────────
  // Pin the debounced callback in a ref so the sync effect's dep array stays
  // stable; `useDebouncedCallback`'s return reference can change between
  // renders, which would otherwise refire the effect.
  const debouncedServerSync = useDebouncedCallback(
    (next: CartItem[]) => submitSync({ items: next }),
    SYNC_DEBOUNCE_MS,
    { leading: false, trailing: true }
  );
  const debouncedServerSyncRef = useRef(debouncedServerSync);
  useEffect(() => {
    debouncedServerSyncRef.current = debouncedServerSync;
  });

  useEffect(() => {
    if (!isHydrated || !userId || !serverSynced) return;
    if (skipNextServerSyncRef.current) {
      skipNextServerSyncRef.current = false;
      return;
    }
    debouncedServerSyncRef.current(items);
  }, [items, userId, serverSynced, isHydrated]);

  // ── Mutation API ───────────────────────────────────────────────────────────
  const addItem = (item: Omit<CartItem, "quantity">) => {
    // Admins cannot purchase. Defensive no-op in case any UI path slips through.
    if (isAdmin) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
