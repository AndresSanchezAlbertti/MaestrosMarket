import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-slate-500">
        Hola, <span className="font-medium text-slate-800">{user?.fullName}</span>
        {user?.union && (
          <span className="ml-2 text-slate-400">· {user.union.name}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-secondary" onClick={() => navigate('/perfil')}>
          Perfil
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
