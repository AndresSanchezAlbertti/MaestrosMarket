import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { union: true },
    });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    if (user.verificationStatus !== 'VERIFIED' && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Tu cuenta todavía no fue verificada por un administrador',
        verificationStatus: user.verificationStatus,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
