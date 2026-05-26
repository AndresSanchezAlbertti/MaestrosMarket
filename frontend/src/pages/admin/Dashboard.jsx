import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api.js';
import Spinner from '../../components/ui/Spinner.jsx';

function StatCard({ label, value, hint, accent = 'bg-brand-600' }) {
  return (
    <div className="card p-5">
      <div className={`w-2 h-2 rounded-full ${accent} mb-3`} />
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
      {hint && <div className="text-xs text-slate-400 mt-2">{hint}</div>}
    </div>
  );
}

const typeLabel = {
  PRODUCT: 'Productos',
  SERVICE: 'Servicios',
  TRUEQUE: 'Trueques',
  EMPRENDIMIENTO: 'Emprendimientos',
  BOLSA: 'Bolsa',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de administración</h1>
        <p className="text-sm text-slate-500">Métricas y moderación de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Usuarios totales" value={stats.users} accent="bg-brand-600" />
        <StatCard
          label="Usuarios pendientes"
          value={stats.pendingUsers}
          hint="Esperan verificación"
          accent="bg-amber-500"
        />
        <StatCard label="Publicaciones" value={stats.listings} accent="bg-emerald-500" />
        <StatCard
          label="Publicaciones pendientes"
          value={stats.pendingListings}
          hint="Esperan moderación"
          accent="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Publicaciones por tipo</h3>
          {Object.keys(stats.listingsByType || {}).length === 0 ? (
            <div className="text-sm text-slate-500">Aún no hay publicaciones aprobadas.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.listingsByType).map(([type, count]) => {
                const max = Math.max(...Object.values(stats.listingsByType));
                const pct = max > 0 ? (count / max) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">{typeLabel[type] || type}</span>
                      <span className="font-medium text-slate-900">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Acciones rápidas</h3>
          <div className="space-y-3">
            <Link to="/admin/usuarios" className="btn-secondary w-full justify-between">
              Revisar usuarios pendientes
              <span className="badge-pending">{stats.pendingUsers}</span>
            </Link>
            <Link to="/admin/publicaciones" className="btn-secondary w-full justify-between">
              Revisar publicaciones pendientes
              <span className="badge-pending">{stats.pendingListings}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
