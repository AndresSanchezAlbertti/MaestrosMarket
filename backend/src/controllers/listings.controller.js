import { prisma } from '../lib/prisma.js';

export async function list(req, res) {
  const { type, status, q, visibility, page = '1', pageSize = '20' } = req.query;

  const and = [];

  // Estado: anónimos y usuarios MEMBER solo ven APPROVED.
  // ADMIN puede filtrar por status si lo pasa.
  if (!req.user || req.user.role !== 'ADMIN') {
    and.push({ status: 'APPROVED' });
  } else if (status) {
    and.push({ status });
  }

  if (type) and.push({ type });
  if (visibility) and.push({ visibility });

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  // Visibilidad UNION_ONLY: solo miembros del mismo sindicato (o autor o admin)
  if (!req.user) {
    and.push({ visibility: 'NETWORK' });
  } else if (req.user.role !== 'ADMIN') {
    and.push({
      OR: [
        { visibility: 'NETWORK' },
        { visibility: 'UNION_ONLY', author: { unionId: req.user.unionId } },
        { authorId: req.user.id },
      ],
    });
  }

  const where = and.length ? { AND: and } : {};

  const take = Math.min(parseInt(pageSize, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            unionId: true,
            union: { select: { name: true } },
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({ items, total, page: Number(page), pageSize: take });
}

export async function detail(req, res) {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
          unionId: true,
          union: { select: { name: true } },
        },
      },
    },
  });
  if (!listing) return res.status(404).json({ error: 'Publicación no encontrada' });

  const isAdmin = req.user?.role === 'ADMIN';
  const isAuthor = req.user?.id === listing.authorId;

  if (listing.status !== 'APPROVED' && !isAdmin && !isAuthor) {
    return res.status(403).json({ error: 'No tenés acceso a esta publicación' });
  }

  if (
    listing.visibility === 'UNION_ONLY' &&
    !isAdmin &&
    !isAuthor &&
    (!req.user || req.user.unionId !== listing.author.unionId)
  ) {
    return res.status(403).json({ error: 'Publicación restringida a miembros del sindicato' });
  }

  res.json(listing);
}

export async function create(req, res) {
  const { title, description, type, price, currency, location, imageUrl, visibility } = req.body;

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      type,
      price: price ?? null,
      currency: currency || 'ARS',
      location,
      imageUrl,
      visibility: visibility || 'NETWORK',
      status: 'PENDING',
      authorId: req.user.id,
    },
  });
  res.status(201).json(listing);
}

export async function update(req, res) {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Publicación no encontrada' });
  if (listing.authorId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo el autor puede editar' });
  }

  const data = { ...req.body };
  // Si edita el autor (no admin), vuelve a quedar pendiente de moderación
  if (req.user.role !== 'ADMIN') {
    data.status = 'PENDING';
    data.rejectionReason = null;
  }

  const updated = await prisma.listing.update({ where: { id: listing.id }, data });
  res.json(updated);
}
