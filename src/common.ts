import { z } from 'zod';

/** Dinero siempre en centavos MXN (enteros, no negativos). Para saldos con signo usar `SignedCents`. */
export const MoneyCents = z.number().int().nonnegative();
/** Centavos con signo (saldos y movimientos del ledger). */
export const SignedCents = z.number().int();

/** Fecha-hora ISO 8601 en UTC tal como la serializa la api (`Date#toJSON`). */
export const IsoDateTime = z.iso.datetime();

export const LatLng = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type LatLng = z.infer<typeof LatLng>;

export const Place = LatLng.extend({
  address: z.string().min(1),
  placeId: z.string().optional(),
});
export type Place = z.infer<typeof Place>;

/** Teléfono MX en E.164 (`+52` + 10 dígitos). */
export const PhoneMx = z.string().regex(/^\+52\d{10}$/, 'Teléfono MX en formato +52XXXXXXXXXX');

/** Query de paginación (los query params llegan como string: se coaccionan). */
export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

/** Respuesta paginada: `Paginated(RideSummary)`. */
export const Paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
  });
export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

/** `GET /health`. */
export const HealthResponse = z.object({
  status: z.enum(['ok', 'error']),
  checks: z.object({ database: z.enum(['up', 'down']), redis: z.enum(['up', 'down']) }),
});
export type HealthResponse = z.infer<typeof HealthResponse>;
