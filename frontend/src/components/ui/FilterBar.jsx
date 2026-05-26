export default function FilterBar({ q, onQ, type, onType, types, extra }) {
  return (
    <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-end">
      <div className="flex-1">
        <label className="label">Buscar</label>
        <input
          className="input"
          placeholder="Título o descripción…"
          value={q || ''}
          onChange={(e) => onQ(e.target.value)}
        />
      </div>
      {types && (
        <div className="md:w-56">
          <label className="label">Tipo</label>
          <select
            className="input"
            value={type || ''}
            onChange={(e) => onType(e.target.value || undefined)}
          >
            <option value="">Todos</option>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {extra}
    </div>
  );
}
