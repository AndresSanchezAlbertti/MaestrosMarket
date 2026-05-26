export default function EmptyState({ title, message, action }) {
  return (
    <div className="card p-10 text-center">
      <div className="text-4xl mb-2">📭</div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
