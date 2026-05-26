import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function can(user, ...perms) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return perms.some((p) => user[p] === true);
}

const navUser = (user) => {
  const items = [{ to: '/', label: 'Inicio', end: true }];
  if (can(user, 'canView')) {
    items.push(
      { to: '/marketplace', label: 'Marketplace' },
      { to: '/bolsa', label: 'Bolsa de trabajo' },
      { to: '/emprendimientos', label: 'Emprendimientos' },
      { to: '/sindicatos', label: 'Sindicatos' }
    );
  }
  if (can(user, 'canPublish')) {
    items.push({ to: '/publicar', label: 'Publicar' });
  }
  items.push(
    { to: '/mensajes', label: 'Mensajes' },
    { to: '/perfil', label: 'Perfil' },
    { to: '/pagos', label: 'Pagos' }
  );
  return items;
};

const navAdmin = (user) => {
  const items = [];
  if (can(user, 'canModerate', 'canManageUsers')) {
    items.push({ to: '/admin', label: 'Dashboard', end: true });
  }
  if (can(user, 'canModerate')) {
    items.push({ to: '/admin/publicaciones', label: 'Publicaciones' });
  }
  if (can(user, 'canManageUsers')) {
    items.push({ to: '/admin/usuarios', label: 'Usuarios' });
  }
  if (user?.role === 'ADMIN') {
    items.push({ to: '/admin/sindicatos', label: 'Sindicatos' });
  }
  return items;
};

function linkClass({ isActive }) {
  return [
    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');
}

export default function Sidebar() {
  const { user } = useAuth();
  const adminLinks = navAdmin(user);

  return (
    <aside className="w-60 bg-white border-r border-slate-200 px-4 py-6 hidden md:flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
          D
        </div>
        <div>
          <div className="font-semibold text-slate-900 leading-tight">DocenMarket</div>
          <div className="text-xs text-slate-500">Comunidad docente</div>
        </div>
      </div>

      <nav className="space-y-1">
        {navUser(user).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {adminLinks.length > 0 && (
        <>
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Administración
          </div>
          <nav className="space-y-1">
            {adminLinks.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
