import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Package, ChevronDown, ChevronUp, FileText, Download } from "lucide-react";
import { useAuth } from "~/components/providers/auth-provider";
import { forbidAdmin } from "~/lib/auth/admin.server";
import { db } from "~/lib/db/client";
import { orders } from "~/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export function meta() {
  return [{ title: "My Orders — Minashow" }];
}

// ─── Status styling ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

// ─── Loader ──────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  // Admins can't have personal orders — bounce them to /admin.
  // Guests pass through and see the "Sign in" CTA.
  const user = await forbidAdmin(request);
  if (!user) return { userOrders: [] };

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    with: { items: true, invoice: { with: { lineItems: true } } },
    orderBy: [desc(orders.createdAt)],
  });

  return { userOrders };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type LoaderData = Awaited<ReturnType<typeof loader>>;
type DBOrder = LoaderData["userOrders"][number];
type DBInvoice = NonNullable<DBOrder["invoice"]>;

// ─── Invoice helpers ─────────────────────────────────────────────────────────

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  etransfer: "Interac e-Transfer",
  zeffy: "Zeffy",
};

/** Priced invoice panel shown to the customer once the admin has set prices. */
function InvoicePanel({ order, invoice }: { order: DBOrder; invoice: DBInvoice }) {
  const isPaid = invoice.status === "paid";
  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-blue" />
          <span className="font-sans font-bold text-gray-900 text-sm">Invoice</span>
          <span className="text-xs text-gray-400 font-mono">{invoice.invoiceNumber}</span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isPaid ? "Paid" : "Pending payment"}
        </span>
      </div>

      <div className="flex flex-col gap-1 mb-3">
        {invoice.lineItems.map((li) => (
          <div key={li.id} className="flex justify-between text-sm font-sans">
            <span className="text-gray-700">
              {li.description} <span className="text-gray-400">× {li.quantity}</span>
            </span>
            <span className="text-gray-900 font-semibold">{money(li.lineTotalCents)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-0.5 text-sm font-sans pt-2 border-t border-gray-100 ml-auto w-52">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{money(invoice.subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>
            {invoice.taxLabel ?? "Tax"} ({(invoice.taxRateBps / 100).toFixed(2).replace(/\.00$/, "")}%)
          </span>
          <span>{money(invoice.taxCents)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>{money(invoice.totalCents)}</span>
        </div>
      </div>

      {isPaid && invoice.paymentMethod && (
        <p className="text-xs text-gray-500 font-sans mt-2">
          Paid via {PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod}
        </p>
      )}

      <a
        href={`/orders/${order.id}/invoice-pdf`}
        className="mt-3 inline-flex items-center gap-2 text-sm font-sans font-bold text-brand-blue hover:underline"
      >
        <Download className="w-4 h-4" /> Download {isPaid ? "receipt" : "invoice"} (PDF)
      </a>
    </div>
  );
}

type TabKey = "all" | "pending" | "confirmed" | "processing" | "delivered";

// ─── Order card ──────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: DBOrder }) {
  const [expanded, setExpanded] = useState(false);
  const statusCls = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div
        className="p-4 sm:p-5 flex flex-wrap items-center gap-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-gray-900 font-sans font-bold font-mono text-sm">
              {order.id.slice(0, 8)}…
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusCls} font-sans font-bold`}>
              {order.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-sans">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right">
          {order.invoice || order.totalCents > 0 ? (
            <p className="text-gray-900 font-display font-semibold text-[1.1rem]">
              {money(order.invoice?.totalCents ?? order.totalCents)}
            </p>
          ) : (
            <p className="text-amber-700 font-sans font-semibold text-sm">Pricing pending</p>
          )}
        </div>

        <button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
          {/* Once priced, the invoice panel below is the source of truth for
              items + prices. Until then, show what was ordered (prices pending). */}
          {!order.invoice && (
            <div className="flex flex-col gap-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm font-sans">
                    {item.itemName} × {item.quantity}
                  </span>
                  <span className="text-amber-700 text-xs font-sans font-semibold">
                    Pricing pending
                  </span>
                </div>
              ))}
            </div>
          )}

          {order.notes && (
            <p className="text-gray-500 text-sm font-sans">
              <span className="font-semibold">Notes:</span> {order.notes}
            </p>
          )}

          {order.invoice && <InvoicePanel order={order} invoice={order.invoice} />}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const { userOrders } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-gray-900 mb-2 font-display text-2xl font-semibold">
            Sign in to see your orders
          </h2>
          <p className="text-gray-500 mb-5 font-sans">
            You need to be logged in to view your order history.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-full transition-colors hover:opacity-90 font-sans font-bold bg-brand-blue"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "All orders" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "delivered", label: "Delivered" },
  ];

  const filtered =
    activeTab === "all" ? userOrders : userOrders.filter((o) => o.status === activeTab);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-1 font-display text-[2rem] font-bold">My orders</h1>
          <p className="text-gray-500 font-sans">
            Welcome back, {user?.name?.split(" ")[0]}.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1.5 mb-6 w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all font-sans ${activeTab === tab.key
                  ? "bg-white shadow-sm font-bold text-brand-blue"
                  : "text-gray-600 font-semibold hover:text-gray-900"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-sans">No orders in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Shop CTA */}
        <div className="mt-10 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border bg-secondary border-blue-200">
          <div>
            <p className="text-gray-800 font-sans font-bold">
              Need something for your next show?
            </p>
            <p className="text-gray-500 text-sm font-sans">
              Browse our full catalog of show materials.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-white px-5 py-2.5 rounded-full transition-colors hover:opacity-90 font-sans font-bold bg-brand-blue"
          >
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  );
}
