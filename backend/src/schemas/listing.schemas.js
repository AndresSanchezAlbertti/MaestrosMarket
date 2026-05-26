import { z } from 'zod';

const listingTypes = ['PRODUCT', 'SERVICE', 'TRUEQUE', 'EMPRENDIMIENTO', 'BOLSA'];
const visibilities = ['UNION_ONLY', 'NETWORK'];

export const createListingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.enum(listingTypes),
  price: z.number().nonnegative().optional().nullable(),
  currency: z.string().default('ARS'),
  location: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  visibility: z.enum(visibilities).default('NETWORK'),
});

export const updateListingSchema = createListingSchema.partial();

export const rejectSchema = z.object({
  reason: z.string().min(3),
});
