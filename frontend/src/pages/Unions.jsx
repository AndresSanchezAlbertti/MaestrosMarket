import { useEffect, useState } from 'react';
import { unionsApi } from '../api/unions.api.js';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Unions() {
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    unionsApi.list().then(setUnions).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Sindicatos</h1>
        <p className="text-sm text-slate-500">Red de organizaciones gremiales asociadas</p>
      </div>
      {unions.length === 0 ? (
        <EmptyState title="No hay sindicatos cargados" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unions.map((u) => (
            <div key={u.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{u.name}</h3>
                  <p className="text-sm text-slate-500">{u.province}</p>
                </div>
                <span className="badge bg-brand-100 text-brand-800">
                  {u._count?.members ?? 0} miembros
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
