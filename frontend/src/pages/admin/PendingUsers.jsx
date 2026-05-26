import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function PendingUsers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.pendingUsers().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    await adminApi.approveUser(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function reject(id) {
    if (!reason.trim()) return;
    await adminApi.rejectUser(id, reason);
    setItems((prev) => prev.filter((x) => x.id !== id));
    setRejectingId(null);
    setReason('');
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios pendientes</h1>
        <p className="text-sm text-slate-500">
          Verificá manualmente el número de afiliado de cada docente
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Sin solicitudes pendientes" message="Todos los afiliados fueron verificados." />
      ) : (
        <div className="space-y-3">
          {items.map((u) => (
            <div key={u.id} className="card p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-pending">Pendiente</span>
                    {u.union?.name && (
                      <span className="badge bg-indigo-100 text-indigo-800">{u.union.name}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{u.fullName}</h3>
                  <div className="text-sm text-slate-600 mt-1">{u.email}</div>
                  <div className="text-xs text-slate-500 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <b>Afiliado:</b> {u.affiliateNumber || '—'}
                    </div>
                    <div>
                      <b>Provincia:</b> {u.province || '—'}
                    </div>
                    <div>
                      <b>Solicitado:</b>{' '}
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col md:w-44 shrink-0">
                  <button className="btn-primary w-full" onClick={() => approve(u.id)}>
                    Aprobar
                  </button>
                  <button
                    className="btn-danger w-full"
                    onClick={() => {
                      setRejectingId(u.id);
                      setReason('');
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>

              {rejectingId === u.id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="label">Motivo del rechazo</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explicá brevemente el motivo…"
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
                      onClick={() => reject(u.id)}
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
