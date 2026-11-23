import { z } from 'zod';
import { IsoDateTime, MoneyCents, PaginationQuery, Place } from './common.js';
import { PaymentMethod, PaymentMethodSchema, RideStatusSchema } from './enums.js';

/** Vehículo tal como se muestra al pasajero / despacho. */
export const VehicleSummary = z.object({ plate: z.string(), model: z.string(), color: z.string() });
export type VehicleSummary = z.infer<typeof VehicleSummary>;

/** `POST /rides` (pasajero). */
export const CreateRideDto = z.object({
  quoteId: z.string(),
  paymentMethod: PaymentMethodSchema.default(PaymentMethod.cash),
  notes: z.string().max(200).optional(),
});
export type CreateRideDto = z.infer<typeof CreateRideDto>;

export const RideDriver = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  rating: z.number().nullable(),
  vehicle: VehicleSummary,
});
export type RideDriver = z.infer<typeof RideDriver>;

export const RideSummary = z.object({
  id: z.string(),
  status: RideStatusSchema,
  origin: Place,
  destination: Place,
  estimatedFareCents: MoneyCents,
  finalFareCents: MoneyCents.nullable(),
  paymentMethod: PaymentMethodSchema,
  driver: RideDriver.nullable(),
  createdAt: IsoDateTime,
});
export type RideSummary = z.infer<typeof RideSummary>;

/** Query de listados de viajes (`GET /dispatch/rides?status=&page=&pageSize=`). */
export const RideListQuery = PaginationQuery.extend({
  status: RideStatusSchema.optional(),
});
export type RideListQuery = z.infer<typeof RideListQuery>;
