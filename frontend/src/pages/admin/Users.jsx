import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { unionsApi } from '../../api/unions.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const STATUS_LABEL = {
  PENDING: { className: 'badge-pending', text: 'Pendiente' },
  VERIFIED: { className: 'badge-approved', text: 'Verificado' },
  REJECTED: { className: 'badge-rejected', text: 'Rechazado' },
};

const PERMS = [
  { key: 'canView', label: 'Ver' },
  { key: 'canPublish', label: 'Publicar' },
  { key: 'canModerate', label: 'Moderar' },
  { key: 'canManageUsers', label: 'Gestionar usuarios' },
];

const emptyForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  province: '',
  affiliateNumber: '',
  unionId: '',
  role: 'MEMBER',
  verificationStatus: 'VERIFIED',
  canView: true,
  canPublish: true,
  canModerate: false,
  canManageUsers: false,
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | VERIFIED | REJECTED
  const [search, setSearch] = useState('');

  // Form de creación / edición
  const [editingId, setEditingId] = useState(null); // null = creando
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const callerIsAdmin = currentUser?.role === 'ADMIN';

  function load() {
    setLoading(true);
    Promise.all([adminApi.listUsers(), unionsApi.list()])
      .then(([us, un]) => {
        setUsers(us);
        setUnions(un);
      })
      .catch((e) => setError(e?.response?.data?.error || 'No se pudo cargar'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (filter !== 'ALL') list = list.filter((u) => u.verificationStatus === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filter, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError(null);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({
      email: u.email,
      password: '',
      fullName: u.fullName,
      phone: u.phone || '',
      province: u.province || '',
      affiliateNumber: u.affiliateNumber || '',
      unionId: u.unionId || '',
      role: u.role,
      verificationStatus: u.verificationStatus,
      canView: u.canView,
      canPublish: u.canPublish,
      canModerate: u.canModerate,
      canManageUsers: u.canManageUsers,
    });
    setFormOpen(true);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password; // si no se cambió
        if (!payload.unionId) payload.unionId = null;
        const updated = await adminApi.updateUser(editingId, payload);
        setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      } else {
        const payload = { ...form };
        if (!payload.unionId) payload.unionId = null;
        const created = await adminApi.createUser(payload);
        setUsers((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function doApprove(u) {
    try {
      const updated = await adminApi.approveUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)));
    } catch (err) {
      setError(err?.response?.data?.error || 'Error');
    }
  }

  async function doReject(u) {
    if (!rejectReason.trim()) return;
    try {
      const updated = await adminApi.rejectUser(u.id, rejectReason);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Error');
    }
  }

  async function doDelete(u) {
    try {
      await adminApi.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setConfirmingDelete(null);
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo eliminar');
      setConfirmingDelete(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">
            Crear, editar permisos, aprobar afiliados pendientes
          </p>
        </div>
        {!formOpen && (
          <button className="btn-primary" onClick={openCreate}>
            + Nuevo usuario
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {formOpen && (
        <form onSubmit={save} className="card p-5 mb-5">
          <div className="font-semibold text-slate-900 mb-4">
            {editingId ? 'Editar usuario' : 'Nuevo usuario'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre completo</label>
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="label">
                Contraseña {editingId && <span className="text-slate-400">(dejá vacío para no cambiar)</span>}
              </label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Provincia</label>
              <input
                className="input"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
            </div>
            <div>
              <label className="label">N° de afiliado</label>
              <input
                className="input"
                value={form.affiliateNumber}
                onChange={(e) => setForm({ ...form, affiliateNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Sindicato</label>
              <select
                className="input"
                value={form.unionId}
                onChange={(e) => setForm({ ...form, unionId: e.target.value })}
              >
                <option value="">— Sin sindicato —</option>
                {unions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.province})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Estado de verificación</label>
              <select
                className="input"
                value={form.verificationStatus}
                onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}
              >
                <option value="VERIFIED">Verificado</option>
                <option value="PENDING">Pendiente</option>
                <option value="REJECTED">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="label">Rol</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                disabled={!callerIsAdmin}
                title={!callerIsAdmin ? 'Solo un admin puede cambiar el rol' : ''}
              >
                <option value="MEMBER">Miembro</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700 mb-2">Permisos</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PERMS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-center gap-2 text-sm text-slate-700 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form[p.key]}
                    onChange={(e) => setForm({ ...form, [p.key]: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  {p.label}
                </label>
              ))}
            </div>
            {form.role === 'ADMIN' && (
              <p className="text-xs text-slate-500 mt-2">
                Los usuarios con rol Admin tienen todos los permisos automáticamente.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="card p-4 mb-5 flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="label">Buscar</label>
          <input
            className="input"
            placeholder="Nombre o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:w-56">
          <label className="label">Estado</label>
          <select
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Todos ({users.length})</option>
            <option value="PENDING">
              Pendientes ({users.filter((u) => u.verificationStatus === 'PENDING').length})
            </option>
            <option value="VERIFIED">
              Verificados ({users.filter((u) => u.verificationStatus === 'VERIFIED').length})
            </option>
            <option value="REJECTED">
              Rechazados ({users.filter((u) => u.verificationStatus === 'REJECTED').length})
            </option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin usuarios" message="No hay usuarios que coincidan con el filtro." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 font-medium">Sindicato</th>
                <th className="text-left px-4 py-3 font-medium">Rol / Estado</th>
                <th className="text-left px-4 py-3 font-medium">Permisos</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isPending = u.verificationStatus === 'PENDING';
                return (
                  <tr key={u.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                      {u.affiliateNumber && (
                        <div className="text-xs text-slate-400">
                          Afiliado: {u.affiliateNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.union?.name || '—'}
                      {u.province && (
                        <div className="text-xs text-slate-400">{u.province}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {u.role === 'ADMIN' ? (
                          <span className="badge bg-purple-100 text-purple-800 self-start">Admin</span>
                        ) : (
                          <span className="badge bg-slate-100 text-slate-700 self-start">Miembro</span>
                        )}
                        <span className={`${STATUS_LABEL[u.verificationStatus].className} self-start`}>
                          {STATUS_LABEL[u.verificationStatus].text}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.role === 'ADMIN' ? (
                          <span className="badge bg-purple-100 text-purple-800">Todos</span>
                        ) : (
                          PERMS.filter((p) => u[p.key]).map((p) => (
                            <span key={p.key} className="badge bg-brand-100 text-brand-800">
                              {p.label}
                            </span>
                          ))
                        )}
                        {u.role !== 'ADMIN' &&
                          !PERMS.some((p) => u[p.key]) && (
                            <span className="text-xs text-slate-400">Ninguno</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {isPending && (
                          <>
                            <button className="btn-primary" onClick={() => doApprove(u)}>
                              Aprobar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => {
                                setRejectingId(u.id);
                                setRejectReason('');
                              }}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button className="btn-secondary" onClick={() => openEdit(u)}>
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => setConfirmingDelete(u)}
                          disabled={u.id === currentUser?.id}
                          title={u.id === currentUser?.id ? 'No podés borrarte a vos mismo' : ''}
                        >
                          Eliminar
                        </button>
                      </div>

                      {rejectingId === u.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <textarea
                            className="input min-h-[60px] text-left"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Motivo del rechazo…"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              className="btn-secondary"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason('');
                              }}
                            >
                              Cancelar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => doReject(u)}
                              disabled={!rejectReason.trim()}
                            >
                              Confirmar rechazo
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmingDelete && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmingDelete(null)}
        >
          <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-900 text-lg">¿Eliminar usuario?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Vas a eliminar a <b>{confirmingDelete.fullName}</b> ({confirmingDelete.email}).
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setConfirmingDelete(null)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={() => doDelete(confirmingDelete)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
