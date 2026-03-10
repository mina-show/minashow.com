export type OrderStatus = 'Pending' | 'Payment Link Sent' | 'Paid' | 'Fulfilled';

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
  church: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentLink?: string;
  invoiceUrl?: string;
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    date: '2026-02-10',
    customer: 'Mary Hanna',
    church: 'St. Mark Church — Cairo',
    email: 'mary@stmark.eg',
    phone: '+20 100 000 0001',
    items: [
      { productId: '1', name: 'Leo the Lion', price: 150, quantity: 1 },
      { productId: '6', name: 'Praise Songs Vol. 1', price: 45, quantity: 1 },
    ],
    total: 195,
    status: 'Fulfilled',
    invoiceUrl: '#',
  },
  {
    id: 'ORD-002',
    date: '2026-02-28',
    customer: 'Peter Nabil',
    church: 'St. George Church — Alexandria',
    email: 'peter@stgeorge.eg',
    phone: '+20 100 000 0002',
    items: [{ productId: '4', name: 'Superhero Cape Set', price: 85, quantity: 2 }],
    total: 170,
    status: 'Paid',
    invoiceUrl: '#',
  },
  {
    id: 'ORD-003',
    date: '2026-03-05',
    customer: 'Sara Youssef',
    church: 'Coptic Orthodox Church — Giza',
    email: 'sara@coptic.eg',
    phone: '+20 100 000 0003',
    items: [
      { productId: '8', name: 'Wooden Lion Puppet', price: 200, quantity: 1 },
      { productId: '7', name: 'Christmas Medley', price: 35, quantity: 1 },
    ],
    total: 235,
    status: 'Payment Link Sent',
    paymentLink: 'https://pay.example.com/ORD-003',
  },
  {
    id: 'ORD-004',
    date: '2026-03-07',
    customer: 'John Marcos',
    church: 'St. Paul Church — Hurghada',
    email: 'john@stpaul.eg',
    phone: '+20 100 000 0004',
    items: [{ productId: '2', name: 'Sammy Sheep', price: 140, quantity: 1 }],
    total: 140,
    status: 'Pending',
  },
];

export const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  'Payment Link Sent': 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
  Fulfilled: 'bg-green-200 text-green-800',
};