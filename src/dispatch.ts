import { z } from 'zod';
import { MoneyCents, PhoneMx, Place } from './common.js';
import { PaymentMethod } from './enums.js';

/** Alta de viaje manual (llamada telefónica) desde despacho — `POST /dispatch/rides`. */
export const CreateDispatchRideDto = z.object({
  passengerPhone: PhoneMx,
  passengerName: z.string().trim().min(2, 'Nombre requerido').max(80),
  origin: Place,
  destination: Place,
  /** Despacho manual: solo efectivo. */
  paymentMethod: z.literal(PaymentMethod.cash).default(PaymentMethod.cash),
  notes: z.string().max(200).optional(),
});
export type CreateDispatchRideDto = z.infer<typeof CreateDispatchRideDto>;

/** Sugerencia de Places Autocomplete (siempre vía api) — `GET /maps/places/autocomplete`. */
export const PlaceSuggestion = z.object({
  placeId: z.string(),
  description: z.string(),
  secondary: z.string().optional(),
});
export type PlaceSuggestion = z.infer<typeof PlaceSuggestion>;

export const PlaceAutocompleteQuery = z.object({
  input: z.string().min(1),
  sessionToken: z.string().min(1),
});
export type PlaceAutocompleteQuery = z.infer<typeof PlaceAutocompleteQuery>;

// ---- Dashboard ----

/** KPIs del tenant (`GET /dashboard/kpis`). */
export const TenantKpis = z.object({
  ridesToday: z.number().int(),
  ridesInProgress: z.number().int(),
  driversOnline: z.number().int(),
  driversTotal: z.number().int(),
  revenueTodayCents: MoneyCents,
  commissionTodayCents: MoneyCents,
  totalDriverDebtCents: z.number().int(),
  /** 0–100. */
  cancellationRatePct: z.number().min(0).max(100),
});
export type TenantKpis = z.infer<typeof TenantKpis>;

/** KPIs de la plataforma (super_admin, `GET /admin/kpis`). */
export const PlatformKpis = z.object({
  tenantsActive: z.number().int(),
  tenantsSuspended: z.number().int(),
  ridesToday: z.number().int(),
  driversOnline: z.number().int(),
});
export type PlatformKpis = z.infer<typeof PlatformKpis>;
