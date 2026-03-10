import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Send,
  CheckCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Upload,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrders, statusColors, type Order, type OrderStatus } from '../data/orders';

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Payment Link Sent', 'Paid', 'Fulfilled'];

function AdminOrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [actionMsg, setActionMsg] = useState('');

  const statusCls = statusColors[status];

  const triggerAction = (msg: string, newStatus?: OrderStatus) => {
    setActionMsg(msg);
    if (newStatus) setStatus(newStatus);
    setTimeout(() => setActionMsg(''), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div
        className="p-4 sm:p-5 flex flex-wrap items-center gap-3 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span
              className="text-gray-900"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              {order.id}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full ${statusCls}`}
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              {status}
            </span>
          </div>
          <p
            className="text-gray-500 text-sm"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {order.customer} · {order.church}
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <p
            className="text-gray-900"
            style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: '1.1rem' }}
          >
            ${order.total}
          </p>
          <p
            className="text-gray-400 text-xs"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {new Date(order.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div>
              <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>Customer</p>
              <p className="text-gray-800 text-sm" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>{order.customer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>Church</p>
              <p className="text-gray-800 text-sm" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>{order.church}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>Email</p>
              <a href={`mailto:${order.email}`} className="text-blue-600 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>{order.email}</a>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>Phone</p>
              <p className="text-gray-800 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>{order.phone}</p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 mb-5">
            <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Items ordered</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {item.name} × {item.quantity}
                </span>
                <span className="text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
                  ${item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <span className="text-gray-800 text-sm" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>Total</span>
              <span className="text-gray-900" style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600 }}>${order.total}</span>
            </div>
          </div>

          {/* Action feedback */}
          {actionMsg && (
            <div className="mb-4 px-4 py-2.5 rounded-xl text-sm border" style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', color: '#166534' }}>
              {actionMsg}
            </div>
          )}

          {/* Admin actions */}
          <div className="flex flex-wrap gap-2">
            {status === 'Pending' && (
              <button
                onClick={() => triggerAction('Payment link generated and sent to customer.', 'Payment Link Sent')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
              >
                <Send className="w-4 h-4" />
                Generate & send payment link
              </button>
            )}

            {status === 'Payment Link Sent' && (
              <button
                onClick={() => triggerAction('Order marked as paid.', 'Paid')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm transition-colors hover:opacity-90"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, backgroundColor: '#22C55E' }}
              >
                <CheckCircle className="w-4 h-4" />
                Mark as paid
              </button>
            )}

            {status === 'Paid' && (
              <>
                <button
                  onClick={() => triggerAction('Official invoice uploaded and sent.', 'Fulfilled')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm transition-colors hover:opacity-90"
                  style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, backgroundColor: '#2563EB' }}
                >
                  <Upload className="w-4 h-4" />
                  Upload & send invoice
                </button>
                <button
                  onClick={() => triggerAction('Order marked as fulfilled.', 'Fulfilled')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                >
                  <Package className="w-4 h-4" />
                  Mark as fulfilled
                </button>
              </>
            )}

            {status === 'Fulfilled' && (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 text-sm"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#16A34A' }}
              >
                <CheckCircle className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2
            className="text-gray-900 mb-2"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.5rem', fontWeight: 600 }}
          >
            Admin access required
          </h2>
          <p
            className="text-gray-500 mb-5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            You must be logged in as an admin to view this page.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full transition-colors"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
          >
            Sign in as admin
          </Link>
        </div>
      </div>
    );
  }

  const filtered =
    filterStatus === 'all'
      ? mockOrders
      : mockOrders.filter((o) => o.status === filterStatus);

  const counts = ALL_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: mockOrders.filter((o) => o.status === s).length }),
    {} as Record<OrderStatus, number>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-gray-900 mb-1"
              style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2rem', fontWeight: 700 }}
            >
              Admin dashboard
            </h1>
            <p className="text-gray-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Logged in as {user?.name}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <Users className="w-4 h-4" />
            Customer view
          </Link>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              filterStatus === 'all'
                ? 'bg-gray-900 text-white font-bold'
                : 'bg-white border border-gray-200 text-gray-600 font-semibold hover:border-gray-400'
            }`}
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            All ({mockOrders.length})
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                filterStatus === s
                  ? `${statusColors[s]} font-bold ring-2 ring-offset-1`
                  : `${statusColors[s]} font-semibold opacity-80 hover:opacity-100`
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p style={{ fontFamily: 'Nunito, sans-serif' }}>No orders with this status.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <AdminOrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}