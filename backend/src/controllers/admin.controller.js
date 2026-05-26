import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { emailService } from '../services/email.service.js';

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function stats(_req, res) {
  const [users, pendingUsers, listings, pendingListings, unions, byType] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.union.count({ where: { active: true } }),
    prisma.listing.groupBy({
      by: ['type'],
      _count: { _all: true },
      where: { status: 'APPROVED' },
    }),
  ]);
  res.json({
    users,
    pendingUsers,
    listings,
    pendingListings,
    unions,
    listingsByType: Object.fromEntries(byType.map((r) => [r.type, r._count._all])),
  });
}

export async function pendingListings(_req, res) {
  const items = await prisma.listing.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, fullName: true, email: true, union: { select: { name: true } } } },
    },
  });
  res.json(items);
}

export async function approveListing(req, res) {
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED', rejectionReason: null },
    include: { author: true },
  });
  emailService.listingApproved(listing.author, listing).catch(() => {});
  res.json(listing);
}

export async function rejectListing(req, res) {
  const { reason } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', rejectionReason: reason },
    include: { author: true },
  });
  emailService.listingRejected(listing.author, listing, reason).catch(() => {});
  res.json(listing);
}

export async function pendingUsers(_req, res) {
  const users = await prisma.user.findMany({
    where: { verificationStatus: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { union: true },
  });
  res.json(users.map(publicUser));
}

export async function approveUser(req, res) {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { verificationStatus: 'VERIFIED', rejectionReason: null },
  });
  emailService.userApproved(user).catch(() => {});
  res.json(publicUser(user));
}

export async function rejectUser(req, res) {
  const { reason } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { verificationStatus: 'REJECTED', rejectionReason: reason },
  });
  emailService.userRejected(user, reason).catch(() => {});
  res.json(publicUser(user));
}

// ─── Gestión de sindicatos ────────────────────────────────

export async function listAllUnions(_req, res) {
  const unions = await prisma.union.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { members: true } } },
  });
  res.json(unions);
}

export async function createUnion(req, res) {
  const { name, province, active } = req.body;
  const exists = await prisma.union.findUnique({ where: { name } });
  if (exists) return res.status(409).json({ error: 'Ya existe un sindicato con ese nombre' });
  const union = await prisma.union.create({
    data: { name, province, active: active ?? true },
    include: { _count: { select: { members: true } } },
  });
  res.status(201).json(union);
}

export async function updateUnion(req, res) {
  const { id } = req.params;
  const existing = await prisma.union.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Sindicato no encontrado' });

  if (req.body.name && req.body.name !== existing.name) {
    const dup = await prisma.union.findUnique({ where: { name: req.body.name } });
    if (dup) return res.status(409).json({ error: 'Ya existe un sindicato con ese nombre' });
  }

  const union = await prisma.union.update({
    where: { id },
    data: req.body,
    include: { _count: { select: { members: true } } },
  });
  res.json(union);
}

export async function deleteUnion(req, res) {
  const { id } = req.params;
  const existing = await prisma.union.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });
  if (!existing) return res.status(404).json({ error: 'Sindicato no encontrado' });

  if (existing._count.members > 0) {
    return res.status(409).json({
      error:
        `No se puede eliminar: el sindicato tiene ${existing._count.members} miembro(s). ` +
        'Desactivalo en lugar de borrarlo.',
      members: existing._count.members,
    });
  }

  await prisma.union.delete({ where: { id } });
  res.json({ ok: true });
}

// ─── Gestión completa de usuarios ─────────────────────────

export async function listAllUsers(req, res) {
  const { status, role, q } = req.query;
  const where = {};
  if (status) where.verificationStatus = status;
  if (role) where.role = role;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { union: true, _count: { select: { listings: true } } },
  });
  res.json(users.map(publicUser));
}

export async function getUser(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { union: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(publicUser(user));
}

export async function createUserByAdmin(req, res) {
  const {
    email,
    password,
    fullName,
    phone,
    province,
    affiliateNumber,
    unionId,
    role,
    verificationStatus,
    canView,
    canPublish,
    canModerate,
    canManageUsers,
  } = req.body;

  // Reglas de delegación: solo ADMIN puede crear otros ADMIN
  if (role === 'ADMIN' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo un admin puede crear otro admin' });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

  if (unionId) {
    const union = await prisma.union.findUnique({ where: { id: unionId } });
    if (!union) return res.status(400).json({ error: 'Sindicato inválido' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone: phone || null,
      province: province || null,
      affiliateNumber: affiliateNumber || null,
      unionId: unionId || null,
      role: role || 'MEMBER',
      verificationStatus: verificationStatus || 'VERIFIED',
      canView: canView ?? true,
      canPublish: canPublish ?? true,
      canModerate: canModerate ?? false,
      canManageUsers: canManageUsers ?? false,
    },
    include: { union: true },
  });
  res.status(201).json(publicUser(user));
}

export async function updateUserByAdmin(req, res) {
  const { id } = req.params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

  const isSelf = req.user.id === id;
  const callerIsAdmin = req.user.role === 'ADMIN';

  if (req.body.role && !callerIsAdmin) {
    return res.status(403).json({ error: 'Solo un admin puede cambiar roles' });
  }
  if (target.role === 'ADMIN' && !callerIsAdmin) {
    return res.status(403).json({ error: 'Solo un admin puede editar a otro admin' });
  }
  if (isSelf && req.body.role && req.body.role !== target.role) {
    return res.status(400).json({ error: 'No podés cambiar tu propio rol' });
  }

  const data = { ...req.body };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    include: { union: true },
  });
  res.json(publicUser(updated));
}

export async function deleteUserByAdmin(req, res) {
  const { id } = req.params;
  const target = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { listings: true } } },
  });
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (req.user.id === id) {
    return res.status(400).json({ error: 'No podés borrarte a vos mismo' });
  }
  if (target.role === 'ADMIN' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo un admin puede borrar a otro admin' });
  }
  if (target._count.listings > 0) {
    return res.status(409).json({
      error:
        `El usuario tiene ${target._count.listings} publicación(es). ` +
        'Eliminá o reasigná las publicaciones antes de borrarlo, o desactivá su acceso editando sus permisos.',
      listings: target._count.listings,
    });
  }

  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
}
