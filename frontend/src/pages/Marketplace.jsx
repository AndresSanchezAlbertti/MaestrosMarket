import { useEffect, useState } from 'react';
import { listingsApi } from '../api/listings.api.js';
import FilterBar from '../components/ui/FilterBar.jsx';
import ListingCard from '../components/ui/ListingCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const types = [
  { value: 'PRODUCT', label: 'Productos' },
  { value: 'SERVICE', label: 'Servicios' },
  { value: 'TRUEQUE', label: 'Trueques' },
];

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState();

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      listingsApi
        .list({ q: q || undefined, type })
        .then((data) => setItems(data.items.filter((i) => ['PRODUCT', 'SERVICE', 'TRUEQUE'].includes(i.type))))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [q, type]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
          <p className="text-sm text-slate-500">Productos, servicios y trueques de la comunidad</p>
        </div>
      </div>

      <FilterBar q={q} onQ={setQ} type={type} onType={setType} types={types} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay publicaciones todavía"
          message="Probá ajustar los filtros o creá la primera publicación."
        />
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
