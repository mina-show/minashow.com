import { useState } from 'react';
import { Link } from 'react-router';
import { FileText, Download, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrders, statusColors, type Order } from '../data/orders';

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const statusCls = statusColors[order.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div
        className="p-4 sm:p-5 flex flex-wrap items-center gap-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
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
              {order.status}
            </span>
          </div>
          <p
            className="text-gray-500 text-sm"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {new Date(order.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' · '}
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-right">
          <p
            className="text-gray-900"
            style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: '1.1rem' }}
          >
            ${order.total}
          </p>
        </div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
          {/* Items */}
          <div className="flex flex-col gap-2 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span
                  className="text-gray-700 text-sm"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {item.name} × {item.quantity}
                </span>
                <span
                  className="text-gray-700 text-sm"
                  style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                >
                  ${item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Actions based on status */}
          <div className="flex flex-wrap gap-3">
            {(order.status === 'Pending') && (
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-white transition-colors text-sm"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
              >
                <FileText className="w-4 h-4" />
                Download unofficial invoice
              </a>
            )}

            {order.status === 'Payment Link Sent' && order.paymentLink && (
              <a
                href={order.paymentLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
              >
                Pay now
              </a>
            )}

            {(order.status === 'Paid' || order.status === 'Fulfilled') && order.invoiceUrl && (
              <a
                href={order.invoiceUrl}
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors text-sm hover:opacity-90"
                style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, backgroundColor: '#22C55E' }}
              >
                <Download className="w-4 h-4" />
                Download official invoice
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'Pending' | 'Paid' | 'Fulfilled'>('all');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#BFDBFE' }} />
          <h2
            className="text-gray-900 mb-2"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.5rem', fontWeight: 600 }}
          >
            Sign in to see your orders
          </h2>
          <p
            className="text-gray-500 mb-5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            You need to be logged in to view your order history.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-full transition-colors hover:opacity-90"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, backgroundColor: '#2563EB' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all', label: 'All orders' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Paid', label: 'Paid' },
    { key: 'Fulfilled', label: 'Fulfilled' },
  ];

  const filtered =
    activeTab === 'all' ? mockOrders : mockOrders.filter((o) => o.status === activeTab);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-gray-900 mb-1"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2rem', fontWeight: 700 }}
          >
            My orders
          </h1>
          <p className="text-gray-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Welcome back, {user?.name?.split(' ')[0]}.
            {user?.church && ` Orders for ${user.church}.`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1.5 mb-6 w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm font-bold'
                  : 'text-gray-600 font-semibold hover:text-gray-900'
              }`}
              style={{
                fontFamily: 'Nunito, sans-serif',
                color: activeTab === tab.key ? '#2563EB' : undefined,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p style={{ fontFamily: 'Nunito, sans-serif' }}>No orders in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderStyle: 'solid' }}>
          <div>
            <p
              className="text-gray-800"
              style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            >
              Need something for your next show?
            </p>
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Browse our full catalog of show materials.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-white px-5 py-2.5 rounded-full transition-colors hover:opacity-90"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, backgroundColor: '#2563EB' }}
          >
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  );
}