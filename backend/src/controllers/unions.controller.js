import { prisma } from '../lib/prisma.js';

export async function list(_req, res) {
  const unions = await prisma.union.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { members: true } } },
  });
  res.json(unions);
}

export async function create(req, res) {
  const { name, province, active } = req.body;
  const exists = await prisma.union.findUnique({ where: { name } });
  if (exists) return res.status(409).json({ error: 'Ya existe un sindicato con ese nombre' });
  const union = await prisma.union.create({
    data: { name, province, active: active ?? true },
  });
  res.status(201).json(union);
}
