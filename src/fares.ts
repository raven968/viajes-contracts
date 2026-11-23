import { z } from 'zod';
import { IsoDateTime, MoneyCents, Place } from './common.js';
import { PricingTypeSchema } from './enums.js';

// ---- Cotización (pasajero y despacho) — `POST /fares/quote` ----

export const FareQuoteRequest = z.object({ origin: Place, destination: Place });
export type FareQuoteRequest = z.infer<typeof FareQuoteRequest>;

export const FareQuote = z.object({
  quoteId: z.string(),
  amountCents: MoneyCents,
  distanceMeters: z.number().int(),
  durationSeconds: z.number().int(),
  pricing: PricingTypeSchema,
  polyline: z.string().optional(),
  expiresAt: IsoDateTime,
});
export type FareQuote = z.infer<typeof FareQuote>;

// ---- Configuración de tarifas (admin) — `GET/PATCH /fares/config` ----

/** Tarifa por distancia + tiempo activa del tenant. */
export const FareConfig = z.object({
  id: z.string(),
  name: z.string(),
  baseFareCents: MoneyCents,
  perKmCents: MoneyCents,
  perMinuteCents: MoneyCents,
  minimumFareCents: MoneyCents,
  bookingFeeCents: MoneyCents,
  /** Comisión del tenant en puntos base (1500 = 15 %). */
  commissionBps: z.number().int().min(0).max(10_000),
  updatedAt: IsoDateTime,
});
export type FareConfig = z.infer<typeof FareConfig>;

export const UpdateFareConfigDto = FareConfig.omit({ id: true, updatedAt: true }).partial();
export type UpdateFareConfigDto = z.infer<typeof UpdateFareConfigDto>;

// ---- Zonas con tarifa fija — `GET /fares/zones` ----

/** Zona/colonia con tarifa fija (la geometría no viaja en este DTO). */
export const FareZone = z.object({
  id: z.string(),
  name: z.string(),
  flatFareCents: MoneyCents,
  /** Si origen y destino caen en varias zonas, gana la de mayor prioridad. */
  priority: z.number().int(),
  isActive: z.boolean(),
});
export type FareZone = z.infer<typeof FareZone>;
