import { z } from 'zod';
import { PaymentMethod, RideStatus } from './enums.js';

/** Dinero siempre en centavos MXN (enteros). */
export const MoneyCents = z.number().int().nonnegative();

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

// ---- Auth (pasajero / chofer por OTP) ----
export const RequestOtpDto = z.object({ phone: z.string().regex(/^\+52\d{10}$/, 'Teléfono MX en formato +52XXXXXXXXXX') });
export type RequestOtpDto = z.infer<typeof RequestOtpDto>;

export const VerifyOtpDto = RequestOtpDto.extend({ code: z.string().length(6) });
export type VerifyOtpDto = z.infer<typeof VerifyOtpDto>;

export const AuthTokens = z.object({ accessToken: z.string(), refreshToken: z.string() });
export type AuthTokens = z.infer<typeof AuthTokens>;

// ---- Cotización y viaje ----
export const FareQuoteRequest = z.object({ origin: Place, destination: Place });
export type FareQuoteRequest = z.infer<typeof FareQuoteRequest>;

export const FareQuote = z.object({
  quoteId: z.string(),
  amountCents: MoneyCents,
  distanceMeters: z.number().int(),
  durationSeconds: z.number().int(),
  pricing: z.enum(['zone', 'distance_time']),
  polyline: z.string().optional(),
  expiresAt: z.string().datetime(),
});
export type FareQuote = z.infer<typeof FareQuote>;

export const CreateRideDto = z.object({
  quoteId: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.cash),
  notes: z.string().max(200).optional(),
});
export type CreateRideDto = z.infer<typeof CreateRideDto>;

export const RideSummary = z.object({
  id: z.string(),
  status: z.nativeEnum(RideStatus),
  origin: Place,
  destination: Place,
  estimatedFareCents: MoneyCents,
  finalFareCents: MoneyCents.nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  driver: z
    .object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
      rating: z.number().nullable(),
      vehicle: z.object({ plate: z.string(), model: z.string(), color: z.string() }),
    })
    .nullable(),
  createdAt: z.string().datetime(),
});
export type RideSummary = z.infer<typeof RideSummary>;
