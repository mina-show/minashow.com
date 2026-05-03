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
import { mergeGuestCartDefinition } from "~/lib/actions/merge-guest-cart/action-definition";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  /** True after we've read localStorage (or a logged-in user has finished merging with the server). */
  const [isHydrated, setIsHydrated] = useState(false);
  /** True once the local cart and the server cart have been reconciled for the current user. */
  const [serverSynced, setServerSynced] = useState(false);

  /** Tracks the previous user id so we can detect login/logout/user-switch transitions. */
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  /**
   * When set, the next [items] sync effect will skip its server write. Used after the merge
   * action returns the canonical cart so we don't immediately push it back unchanged.
   */
  const skipNextServerSyncRef = useRef(false);

  const { submit: submitSync } = useAction(syncUserCartDefinition, {
    route: ACTIONS_ROUTE,
  });
  const { submit: submitMerge } = useAction(mergeGuestCartDefinition, {
    route: ACTIONS_ROUTE,
    onSuccess: (data) => {
      skipNextServerSyncRef.current = true;
      setItems(data.items);
      setServerSynced(true);
    },
  });

  // ── Hydrate from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // Corrupt data — start fresh
    }
    setIsHydrated(true);
  }, []);

  // ── Mirror items to localStorage so SSR-rendered guest sessions stay populated ─
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  // ── React to login / logout / initial-mount-with-user ──────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    const previousUserId = lastUserIdRef.current;
    lastUserIdRef.current = userId;

    if (userId) {
      // Logged in (either just transitioned, or initial mount with active session,
      // or switched accounts). Reconcile the device's local cart with the server cart.
      setServerSynced(false);
      submitMerge({ guestItems: items });
      return;
    }

    // No user. If we previously had one, this is a logout — wipe local state.
    // Server cart is preserved on the user's account; localStorage shouldn't bleed
    // between sessions on a shared device.
    if (previousUserId) {
      skipNextServerSyncRef.current = true;
      setItems([]);
      setServerSynced(false);
    }
    // else: anonymous-from-start, nothing to do — localStorage already drives state.
    // We intentionally exclude `items` from deps: this effect should run only on
    // identity transitions, otherwise it would refire on every cart edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isHydrated]);

  // ── Debounced server sync on cart edits (logged-in users only) ─────────────
  const debouncedServerSync = useDebouncedCallback(
    (next: CartItem[]) => submitSync({ items: next }),
    SYNC_DEBOUNCE_MS,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    if (!isHydrated || !userId || !serverSynced) return;
    if (skipNextServerSyncRef.current) {
      skipNextServerSyncRef.current = false;
      return;
    }
    debouncedServerSync(items);
  }, [items, userId, serverSynced, isHydrated, debouncedServerSync]);

  // ── Mutation API ───────────────────────────────────────────────────────────
  const addItem = (item: Omit<CartItem, "quantity">) => {
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
