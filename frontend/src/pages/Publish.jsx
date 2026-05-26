import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listings.api.js';

const typeOptions = [
  { value: 'PRODUCT', label: 'Producto' },
  { value: 'SERVICE', label: 'Servicio' },
  { value: 'TRUEQUE', label: 'Trueque' },
  { value: 'EMPRENDIMIENTO', label: 'Emprendimiento' },
  { value: 'BOLSA', label: 'Bolsa de trabajo' },
];

export default function Publish() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'PRODUCT',
    price: '',
    currency: 'ARS',
    location: '',
    imageUrl: '',
    visibility: 'NETWORK',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: form.price === '' ? null : Number(form.price),
        imageUrl: form.imageUrl || null,
      };
      await listingsApi.create(payload);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo crear la publicación');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto">
        <div className="text-4xl">📝</div>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Publicación enviada</h2>
        <p className="text-sm text-slate-500 mt-2">
          Un administrador la revisará en breve. Cuando sea aprobada, aparecerá en la sección
          correspondiente.
        </p>
        <div className="mt-5 flex gap-2 justify-center">
          <button className="btn-secondary" onClick={() => setSuccess(false)}>
            Crear otra
          </button>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Nueva publicación</h1>
        <p className="text-sm text-slate-500">Las publicaciones se revisan antes de hacerse visibles.</p>
      </div>

      <form className="card p-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="label">Tipo</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Título</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea
            className="input min-h-[120px]"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Precio (opcional)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Moneda</label>
            <select
              className="input"
              value={form.currency}
              onChange={(e) => update('currency', e.target.value)}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Ubicación</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>
          <div>
            <label className="label">URL de imagen (opcional)</label>
            <input
              className="input"
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>
        <div>
          <label className="label">Visibilidad</label>
          <select
            className="input"
            value={form.visibility}
            onChange={(e) => update('visibility', e.target.value)}
          >
            <option value="NETWORK">Toda la red</option>
            <option value="UNION_ONLY">Solo mi sindicato</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button className="btn-primary" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
