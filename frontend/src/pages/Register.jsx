import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { unionsApi } from '../api/unions.api.js';
import { authApi } from '../api/auth.api.js';

const steps = ['Sindicato', 'Datos personales', 'Contraseña'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [unions, setUnions] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    unionId: '',
    affiliateNumber: '',
    fullName: '',
    email: '',
    phone: '',
    province: '',
    password: '',
    passwordConfirm: '',
  });

  useEffect(() => {
    unionsApi.list().then(setUnions).catch(() => setUnions([]));
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function validateStep() {
    setError(null);
    if (step === 0) {
      if (!form.unionId) return 'Elegí un sindicato';
      if (!form.affiliateNumber) return 'Ingresá tu número de afiliado';
    }
    if (step === 1) {
      if (!form.fullName.trim()) return 'Ingresá tu nombre completo';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email inválido';
    }
    if (step === 2) {
      if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
      if (form.password !== form.passwordConfirm) return 'Las contraseñas no coinciden';
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) return setError(err);
    setStep((s) => s + 1);
  }

  async function submit() {
    const err = validateStep();
    if (err) return setError(err);
    setSubmitting(true);
    setError(null);
    try {
      const { passwordConfirm, ...payload } = form;
      await authApi.register(payload);
      setSuccess(true);
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 to-slate-100">
        <div className="card p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-xl font-semibold text-slate-900">Solicitud enviada</h2>
          <p className="text-sm text-slate-600 mt-2">
            Un administrador verificará tu número de afiliado. Vas a recibir un email cuando esté
            habilitada tu cuenta.
          </p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-brand-50 to-slate-100">
      <div className="card p-8 w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
            D
          </div>
          <div>
            <div className="font-semibold text-slate-900">Crear cuenta</div>
            <div className="text-xs text-slate-500">Comunidad docente verificada</div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6">
          {steps.map((label, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                  i <= step
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200 text-slate-500',
                ].join(' ')}
              >
                {i + 1}
              </div>
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  i < step ? 'bg-brand-600' : 'bg-slate-200'
                } ${i === steps.length - 1 ? 'hidden' : ''}`}
              />
            </div>
          ))}
        </div>

        <div className="text-sm font-medium text-slate-700 mb-4">
          Paso {step + 1} de {steps.length}: {steps[step]}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="label">Sindicato</label>
              <select
                className="input"
                value={form.unionId}
                onChange={(e) => update('unionId', e.target.value)}
              >
                <option value="">Elegí un sindicato…</option>
                {unions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.province})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Número de afiliado</label>
              <input
                className="input"
                value={form.affiliateNumber}
                onChange={(e) => update('affiliateNumber', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Teléfono</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Provincia</label>
                <input
                  className="input"
                  value={form.province}
                  onChange={(e) => update('province', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                className="input"
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => update('passwordConfirm', e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mt-4">{error}</div>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="btn-secondary"
            onClick={() => (step === 0 ? navigate('/login') : setStep(step - 1))}
            disabled={submitting}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </button>
          {step < steps.length - 1 ? (
            <button className="btn-primary" onClick={next}>
              Siguiente
            </button>
          ) : (
            <button className="btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'Enviando…' : 'Crear cuenta'}
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-slate-600 text-center">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Iniciá sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
