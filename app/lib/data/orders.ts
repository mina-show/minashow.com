export type OrderStatus = "Pending" | "Payment Link Sent" | "Paid" | "Fulfilled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  customer: string;
  organization: string;
  email: string;
  phone: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  /** Zeffy payment link sent by admin */
  paymentLink?: string;
  /** Official invoice PDF URL */
  invoiceUrl?: string;
}

/** Tailwind classes per order status */
export const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  "Payment Link Sent": "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
  Fulfilled: "bg-green-200 text-green-800",
};

/** Mock data — replaced by DB in Phase 2 */
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2026-02-10",
    customer: "Mary Hanna",
    organization: "Sunrise Community Center",
    email: "mary@sunrisecenter.org",
    phone: "+1 555 000 0001",
    items: [
      { productId: "1", name: "Leo the Lion", price: 150, quantity: 1 },
      { productId: "6", name: "Soundtrack 1", price: 45, quantity: 1 },
    ],
    total: 195,
    status: "Fulfilled",
    invoiceUrl: "#",
  },
  {
    id: "ORD-002",
    date: "2026-02-28",
    customer: "Peter Nabil",
    organization: "Riverside Arts Center",
    email: "peter@riversidearts.org",
    phone: "+1 555 000 0002",
    items: [{ productId: "4", name: "Superhero Cape Set", price: 85, quantity: 2 }],
    total: 170,
    status: "Paid",
    invoiceUrl: "#",
  },
  {
    id: "ORD-003",
    date: "2026-03-05",
    customer: "Sara Youssef",
    organization: "Greenfield Youth Club",
    email: "sara@greenfieldyouth.org",
    phone: "+1 555 000 0003",
    items: [
      { productId: "8", name: "Wooden Lion Puppet", price: 200, quantity: 1 },
      { productId: "7", name: "Soundtrack 2", price: 35, quantity: 1 },
    ],
    total: 235,
    status: "Payment Link Sent",
    paymentLink: "https://www.zeffy.com/en-US/donation-form/minashow",
  },
  {
    id: "ORD-004",
    date: "2026-03-07",
    customer: "John Marcos",
    organization: "Lakeside Community Theater",
    email: "john@lakesidetheater.org",
    phone: "+1 555 000 0004",
    items: [{ productId: "2", name: "Sammy Sheep", price: 140, quantity: 1 }],
    total: 140,
    status: "Pending",
  },
];
