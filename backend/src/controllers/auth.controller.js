import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res) {
  const { email, password, fullName, phone, province, unionId, affiliateNumber } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

  const union = await prisma.union.findUnique({ where: { id: unionId } });
  if (!union) return res.status(400).json({ error: 'Sindicato inválido' });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      province: province || union.province,
      unionId,
      affiliateNumber,
      role: 'MEMBER',
      verificationStatus: 'PENDING',
    },
    include: { union: true },
  });

  res.status(201).json({
    user: publicUser(user),
    message:
      'Cuenta creada. Un administrador verificará tu número de afiliado antes de habilitar el acceso.',
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { union: true },
  });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  if (user.verificationStatus === 'PENDING' && user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Tu cuenta está pendiente de verificación por un administrador.',
      verificationStatus: 'PENDING',
    });
  }
  if (user.verificationStatus === 'REJECTED' && user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Tu solicitud fue rechazada.',
      verificationStatus: 'REJECTED',
      reason: user.rejectionReason,
    });
  }

  const token = signToken(user.id);
  res.json({ token, user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
