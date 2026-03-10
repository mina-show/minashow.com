import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { products, categories, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const ALL_TYPES = 'All Types';

const categoryColors: Record<string, string> = {
  mascots: '#2563EB',
  costumes: '#EF4444',
  soundtracks: '#FACC15',
  marionettes: '#22C55E',
};

export function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedType, setSelectedType] = useState(ALL_TYPES);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [addedId, setAddedId] = useState<string | null>(null);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach((p) => p.type && types.add(p.type));
    return [ALL_TYPES, ...Array.from(types)];
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (selectedType !== ALL_TYPES) {
      list = list.filter((p) => p.type === selectedType);
    }
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCategory, selectedType, sortBy]);

  const handleAdd = (p: Product) => {
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      quantity: 1,
      image: p.image,
      category: p.category,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const activeCat = categories.find((c) => c.id === selectedCategory);
  const heroBg = activeCat ? categoryColors[activeCat.id] : '#3B82F6';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top banner */}
      <div className="relative py-12" style={{ backgroundColor: heroBg }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <h1
            className="text-white"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2.25rem', fontWeight: 700 }}
          >
            {activeCat ? activeCat.name : 'Shop'}
          </h1>
          {activeCat && (
            <p
              className="text-white/80 mt-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {activeCat.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 font-semibold'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all border font-semibold ${
                  selectedCategory === cat.id
                    ? `text-white shadow-sm`
                    : `bg-white ${cat.textClass} ${cat.borderClass} hover:${cat.bgClass}`
                }`}
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  backgroundColor: selectedCategory === cat.id ? categoryColors[cat.id] : undefined,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm bg-white border border-gray-200 rounded-full px-4 py-1.5 text-gray-600 outline-none cursor-pointer"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
          >
            <option value="default">Default sort</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-full px-4 py-1.5 text-gray-600 outline-none cursor-pointer"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
          >
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p
          className="text-sm text-gray-400 mb-6"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </p>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p style={{ fontFamily: 'Nunito, sans-serif' }}>No products match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => {
              const cat = categories.find((c) => c.id === p.category);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all group"
                >
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="w-full h-48 overflow-hidden">
                      <ImageWithFallback
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    {p.type && cat && (
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${cat.bgClass} ${cat.textClass} mb-2`}
                        style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                      >
                        {p.type}
                      </span>
                    )}
                    <Link to={`/product/${p.id}`}>
                      <h3
                        className="text-gray-900 mb-1 hover:text-blue-600 transition-colors"
                        style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}
                      >
                        {p.name}
                      </h3>
                    </Link>
                    <p
                      className="text-gray-500 text-sm mb-4 line-clamp-2"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-gray-900"
                        style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                        }}
                      >
                        ${p.price}
                      </span>
                      <button
                        onClick={() => handleAdd(p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all text-white`}
                        style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 700,
                          backgroundColor: addedId === p.id ? '#22C55E' : '#2563EB',
                        }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {addedId === p.id ? 'Added!' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}