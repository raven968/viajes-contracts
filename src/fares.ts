import { z } from 'zod';
import { IsoDateTime, MoneyCents, Place } from './common.js';
import { PricingTypeSchema } from './enums.js';

// ---- Cotización (pasajero y despacho) — `POST /fares/quote` ----

/**
 * Origen y destino como `Place` (coordenadas + dirección legible, p. ej. de `GET /maps/places/:placeId`
 * o `GET /maps/reverse-geocode`). El origen debe estar dentro del área de servicio del tenant.
 */
export const FareQuoteRequest = z.object({ origin: Place, destination: Place });
export type FareQuoteRequest = z.infer<typeof FareQuoteRequest>;

/** Zona con tarifa fija aplicada (`pricing: 'zone'`). */
export const FareQuoteZone = z.object({ zoneId: z.string(), zoneName: z.string() });
export type FareQuoteZone = z.infer<typeof FareQuoteZone>;

/**
 * Desglose de la tarifa (transparencia para el pasajero). Siempre se cumple:
 * `bookingFeeCents + baseFareCents + distanceCents + timeCents + zoneFareCents + minimumAdjustmentCents + roundingCents = totalCents`.
 * - `distance_time`: `baseFareCents`/`distanceCents`/`timeCents` > 0, `zoneFareCents` = 0.
 * - `zone`: `zoneFareCents` = tarifa fija de la zona; base/distancia/tiempo = 0 y no aplica mínimo.
 */
export const FareBreakdown = z.object({
  bookingFeeCents: MoneyCents,
  baseFareCents: MoneyCents,
  distanceCents: MoneyCents,
  timeCents: MoneyCents,
  zoneFareCents: MoneyCents,
  /** Lo que se sumó para llegar a la tarifa mínima (0 si no aplicó). */
  minimumAdjustmentCents: MoneyCents,
  /** true si se cobró la tarifa mínima. */
  minimumApplied: z.boolean(),
  /** Lo que se sumó al redondear hacia arriba al múltiplo del tenant (p. ej. $5) para pago en efectivo. */
  roundingCents: MoneyCents,
  totalCents: MoneyCents,
});
export type FareBreakdown = z.infer<typeof FareBreakdown>;

/**
 * Cotización. Vive `expiresAt` (~10 min) en el servidor; para pedir el viaje se manda su `quoteId`
 * (`CreateRideDto.quoteId`). Vencida ⇒ `quote_expired`; desconocida ⇒ `quote_not_found`: volver a cotizar.
 */
export const FareQuote = z.object({
  quoteId: z.string(),
  /** Monto a cobrar (= `breakdown.totalCents`), centavos MXN. */
  amountCents: MoneyCents,
  currency: z.literal('MXN'),
  pricing: PricingTypeSchema,
  /** Zona aplicada si `pricing === 'zone'`; `null` en `distance_time`. */
  zone: FareQuoteZone.nullable(),
  distanceMeters: z.number().int().nonnegative(),
  durationSeconds: z.number().int().nonnegative(),
  /** Ruta en formato Encoded Polyline de Google (precisión 5) para dibujarla en el mapa. */
  polyline: z.string(),
  breakdown: FareBreakdown,
  origin: Place,
  destination: Place,
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
  /** El total se redondea hacia arriba a este múltiplo (100 = $1, 500 = $5); 0 o 1 = sin redondeo. */
  roundingCents: MoneyCents,
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
  /** Se aplica si el DESTINO cae en la zona; si cae en varias, gana la de mayor prioridad. */
  priority: z.number().int(),
  isActive: z.boolean(),
});
export type FareZone = z.infer<typeof FareZone>;
