import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const cards = [
  {
    to: '/marketplace',
    title: 'Marketplace',
    desc: 'Productos, servicios y trueques entre docentes.',
    emoji: '🛍️',
  },
  {
    to: '/bolsa',
    title: 'Bolsa de trabajo',
    desc: 'Suplencias, cargos y oportunidades laborales.',
    emoji: '💼',
  },
  {
    to: '/emprendimientos',
    title: 'Emprendimientos',
    desc: 'Conocé los proyectos de la comunidad docente.',
    emoji: '🚀',
  },
  {
    to: '/sindicatos',
    title: 'Sindicatos',
    desc: 'Red de sindicatos asociados y miembros.',
    emoji: '🤝',
  },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-r from-brand-600 to-brand-800 text-white">
        <h1 className="text-2xl font-bold">Hola, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p className="text-brand-100 mt-1 text-sm">
          Bienvenida/o a DocenMarket, la plataforma de intercambio de la comunidad docente.
        </p>
        <div className="mt-4 flex gap-2">
          <Link to="/publicar" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Crear publicación
          </Link>
          <Link to="/marketplace" className="btn bg-brand-700/60 text-white hover:bg-brand-700">
            Explorar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="card p-5 hover:shadow-md transition-shadow">
            <div className="text-3xl">{c.emoji}</div>
            <div className="mt-3 font-semibold text-slate-900">{c.title}</div>
            <div className="text-sm text-slate-500 mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
