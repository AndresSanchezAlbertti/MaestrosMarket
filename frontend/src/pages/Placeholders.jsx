import { useAuth } from '../context/AuthContext.jsx';

function Placeholder({ title, emoji, description }) {
  return (
    <div className="card p-10 text-center max-w-lg mx-auto">
      <div className="text-5xl">{emoji}</div>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
      <div className="mt-4 badge bg-slate-100 text-slate-700">Próximamente</div>
    </div>
  );
}

export function Mensajes() {
  return (
    <Placeholder
      title="Mensajes"
      emoji="💬"
      description="Acá vas a poder ver y responder los mensajes recibidos sobre tus publicaciones."
    />
  );
}

export function Perfil() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-5">Perfil</h1>
      <div className="card p-6 space-y-3">
        <div>
          <div className="text-xs uppercase text-slate-400">Nombre</div>
          <div className="font-medium text-slate-900">{user?.fullName}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400">Email</div>
          <div className="font-medium text-slate-900">{user?.email}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400">Sindicato</div>
          <div className="font-medium text-slate-900">{user?.union?.name || '—'}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400">Número de afiliado</div>
          <div className="font-medium text-slate-900">{user?.affiliateNumber || '—'}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400">Estado</div>
          <div>
            {user?.verificationStatus === 'VERIFIED' ? (
              <span className="badge-approved">Verificado</span>
            ) : user?.verificationStatus === 'PENDING' ? (
              <span className="badge-pending">Pendiente</span>
            ) : (
              <span className="badge-rejected">Rechazado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pagos() {
  return (
    <Placeholder
      title="Pagos"
      emoji="💳"
      description="Próximamente vas a poder integrar pagos con MercadoPago para tus publicaciones."
    />
  );
}
