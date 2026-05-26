import { useEffect, useState } from 'react';
import { listingsApi } from '../api/listings.api.js';
import FilterBar from '../components/ui/FilterBar.jsx';
import ListingCard from '../components/ui/ListingCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Bolsa() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      listingsApi
        .list({ q: q || undefined, type: 'BOLSA' })
        .then((data) => setItems(data.items))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [q]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Bolsa de trabajo</h1>
        <p className="text-sm text-slate-500">Suplencias y oportunidades laborales docentes</p>
      </div>
      <FilterBar q={q} onQ={setQ} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Sin búsquedas activas" message="Cuando se publiquen oportunidades, las verás acá." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
