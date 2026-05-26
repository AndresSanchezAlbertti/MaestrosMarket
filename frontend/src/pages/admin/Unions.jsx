import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const emptyForm = { name: '', province: '', active: true };

export default function AdminUnions() {
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state: si editingId es null y formOpen es true, es alta;
  // si editingId tiene valor, es edición.
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Confirmación de borrado
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  function load() {
    setLoading(true);
    adminApi
      .listUnions()
      .then(setUnions)
      .catch((e) => setError(e?.response?.data?.error || 'No se pudo cargar la lista'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError(null);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({ name: u.name, province: u.province, active: u.active });
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
        const updated = await adminApi.updateUnion(editingId, form);
        setUnions((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      } else {
        const created = await adminApi.createUnion(form);
        setUnions((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      closeForm();
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u) {
    try {
      const updated = await adminApi.updateUnion(u.id, { active: !u.active });
      setUnions((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo actualizar');
    }
  }

  async function confirmDelete(u) {
    try {
      await adminApi.deleteUnion(u.id);
      setUnions((prev) => prev.filter((x) => x.id !== u.id));
      setConfirmingDelete(null);
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo eliminar');
      setConfirmingDelete(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sindicatos</h1>
          <p className="text-sm text-slate-500">Gestioná los sindicatos de la red</p>
        </div>
        {!formOpen && (
          <button className="btn-primary" onClick={openCreate}>
            + Nuevo sindicato
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {formOpen && (
        <form onSubmit={save} className="card p-5 mb-5">
          <div className="font-semibold text-slate-900 mb-4">
            {editingId ? 'Editar sindicato' : 'Nuevo sindicato'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: SUTEBA"
                required
              />
            </div>
            <div>
              <label className="label">Provincia</label>
              <input
                className="input"
                value={form.province}
                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                placeholder="Ej: Buenos Aires"
                required
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 mt-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded border-slate-300"
            />
            Activo (visible en el registro y en /sindicatos)
          </label>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear sindicato'}
            </button>
          </div>
        </form>
      )}

      {unions.length === 0 ? (
        <EmptyState
          title="No hay sindicatos"
          message="Creá el primero para que los docentes puedan elegirlo al registrarse."
          action={
            <button className="btn-primary" onClick={openCreate}>
              + Nuevo sindicato
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Provincia</th>
                <th className="text-left px-4 py-3 font-medium">Miembros</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unions.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.province}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-slate-100 text-slate-700">
                      {u._count?.members ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.active ? (
                      <span className="badge-approved">Activo</span>
                    ) : (
                      <span className="badge bg-slate-200 text-slate-700">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-ghost" onClick={() => toggleActive(u)}>
                        {u.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button className="btn-secondary" onClick={() => openEdit(u)}>
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => setConfirmingDelete(u)}
                        disabled={(u._count?.members ?? 0) > 0}
                        title={
                          (u._count?.members ?? 0) > 0
                            ? 'No se puede eliminar: tiene miembros. Desactivalo.'
                            : 'Eliminar definitivamente'
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {confirmingDelete && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmingDelete(null)}
        >
          <div
            className="card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-slate-900 text-lg">¿Eliminar sindicato?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Vas a eliminar <b>{confirmingDelete.name}</b> ({confirmingDelete.province}). Esta
              acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-secondary" onClick={() => setConfirmingDelete(null)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={() => confirmDelete(confirmingDelete)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
