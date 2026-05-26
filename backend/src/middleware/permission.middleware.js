/**
 * requirePermission('canModerate', 'canManageUsers')
 *
 * Permite el paso si el usuario tiene rol ADMIN o si tiene alguno
 * de los permisos listados en true.
 */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (req.user.role === 'ADMIN') return next();
    const ok = permissions.some((p) => req.user[p] === true);
    if (!ok) {
      return res.status(403).json({
        error: 'Permiso insuficiente',
        required: permissions,
      });
    }
    next();
  };
}
