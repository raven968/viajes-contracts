import { z } from 'zod';
import { IsoDateTime, LatLng, SignedCents } from './common.js';
import { DriverStatusSchema } from './enums.js';
import { VehicleSummary } from './rides.js';

/** Fila de `GET /drivers` (admin). */
export const DriverListItem = z.object({
  id: z.string(),
  /** `null` hasta que el chofer completa su perfil. */
  name: z.string().nullable(),
  phone: z.string(),
  status: DriverStatusSchema,
  rating: z.number().nullable(),
  vehicle: VehicleSummary.nullable(),
  /** Saldo cacheado de la deuda con el tenant (fuente de verdad: ledger). */
  debtCents: SignedCents,
  ridesCompleted: z.number().int().nonnegative(),
  createdAt: IsoDateTime,
});
export type DriverListItem = z.infer<typeof DriverListItem>;

/**
 * Posición en vivo de un chofer para el mapa de despacho.
 * Misma forma en `GET /dispatch/drivers/positions` (foto inicial) y en el evento `dispatch:drivers`.
 */
export const DriverPosition = z.object({
  driverId: z.string(),
  name: z.string().nullable(),
  status: DriverStatusSchema,
  position: LatLng,
  heading: z.number().min(0).max(360).optional(),
});
export type DriverPosition = z.infer<typeof DriverPosition>;
