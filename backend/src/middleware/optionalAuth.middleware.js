import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

/**
 * Si hay un token válido, pobla req.user. Si no, sigue sin error.
 * Útil para rutas públicas que filtran de forma distinta a usuarios logueados.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { union: true },
    });
    if (user && (user.verificationStatus === 'VERIFIED' || user.role === 'ADMIN')) {
      req.user = user;
    }
  } catch {
    // Token inválido: simplemente seguimos como anónimo
  }
  next();
}
