import { prisma } from '../lib/prisma.js';

export async function listForListing(req, res) {
  const { listingId } = req.params;
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Publicación no encontrada' });

  const messages = await prisma.message.findMany({
    where: {
      listingId,
      OR: [{ fromId: req.user.id }, { toId: req.user.id }],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      from: { select: { id: true, fullName: true } },
      to: { select: { id: true, fullName: true } },
    },
  });
  res.json(messages);
}

export async function send(req, res) {
  const { listingId } = req.params;
  const { body, toId } = req.body;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Publicación no encontrada' });

  // Validar destinatario: el otro extremo de la conversación debe ser el autor o el remitente original
  if (toId === req.user.id) {
    return res.status(400).json({ error: 'No podés mensajearte a vos mismo' });
  }

  const message = await prisma.message.create({
    data: {
      body,
      listingId,
      fromId: req.user.id,
      toId,
    },
    include: {
      from: { select: { id: true, fullName: true } },
      to: { select: { id: true, fullName: true } },
    },
  });
  res.status(201).json(message);
}
