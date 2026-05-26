import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const typeLabel = {
  PRODUCT: 'Producto',
  SERVICE: 'Servicio',
  TRUEQUE: 'Trueque',
  EMPRENDIMIENTO: 'Emprendimiento',
  BOLSA: 'Bolsa',
};

export default function PendingListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.pendingListings().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    await adminApi.approveListing(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function reject(id) {
    if (!reason.trim()) return;
    await adminApi.rejectListing(id, reason);
    setItems((prev) => prev.filter((x) => x.id !== id));
    setRejectingId(null);
    setReason('');
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Publicaciones pendientes</h1>
        <p className="text-sm text-slate-500">Aprobá o rechazá las publicaciones que esperan moderación</p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="¡Nada pendiente!" message="Todas las publicaciones fueron moderadas." />
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-slate-100 text-slate-700">
                      {typeLabel[l.type] || l.type}
                    </span>
                    <span className="badge-pending">Pendiente</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{l.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-3">{l.description}</p>
                  <div className="text-xs text-slate-500 mt-2">
                    Por <b>{l.author?.fullName}</b>
                    {l.author?.union?.name && ` · ${l.author.union.name}`} ·{' '}
                    {new Date(l.createdAt).toLocaleDateString('es-AR')}
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col md:w-44 shrink-0">
                  <button className="btn-primary w-full" onClick={() => approve(l.id)}>
                    Aprobar
                  </button>
                  <button
                    className="btn-danger w-full"
                    onClick={() => {
                      setRejectingId(l.id);
                      setReason('');
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>

              {rejectingId === l.id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="label">Motivo del rechazo</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explicá brevemente por qué se rechaza…"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setRejectingId(null);
                        setReason('');
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => reject(l.id)}
                      disabled={!reason.trim()}
                    >
                      Confirmar rechazo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
