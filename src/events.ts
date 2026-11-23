import { z } from 'zod';
import { IsoDateTime, LatLng, MoneyCents } from './common.js';
import { DriverPosition } from './drivers.js';
import { RideStatusSchema } from './enums.js';
import { RideSummary } from './rides.js';

/**
 * Eventos de Socket.IO. Convención de nombres: `dominio:accion`.
 * Cada payload es un esquema Zod (validable en ambos lados) y las interfaces tipadas
 * `ServerToClientEvents` / `ClientToServerEvents` se derivan de ellos.
 */

// ---- Handshake ----

/**
 * `io(url, { auth })`. `tenantId` (id o slug) lo mandan siempre las apps;
 * la api solo lo usa para super_admin (tid null) — para el resto el tenant sale del token.
 */
export const SocketHandshakeAuth = z.object({
  token: z.string().min(1),
  tenantId: z.string().min(1).optional(),
});
export type SocketHandshakeAuth = z.infer<typeof SocketHandshakeAuth>;

/** Rooms a las que la api une los sockets. */
export const SocketRooms = {
  tenant: (tenantId: string) => `tenant:${tenantId}` as const,
  dispatch: (tenantId: string) => `dispatch:${tenantId}` as const,
  ride: (rideId: string) => `ride:${rideId}` as const,
  driver: (driverId: string) => `driver:${driverId}` as const,
  passenger: (passengerId: string) => `passenger:${passengerId}` as const,
};

/** Respuesta (ack) de los eventos cliente→servidor que la llevan. */
export const SocketAck = z.object({ ok: z.boolean(), reason: z.string().optional() });
export type SocketAck = z.infer<typeof SocketAck>;

// ---- Servidor → cliente ----

/** `ride:status` — rooms `ride:{id}`, `passenger:{id}`, `dispatch:{tenantId}`. */
export const RideStatusEvent = z.object({ rideId: z.string(), status: RideStatusSchema, ride: RideSummary });
export type RideStatusEvent = z.infer<typeof RideStatusEvent>;

/** `ride:offer` — room `driver:{id}`. */
export const RideOfferEvent = z.object({
  offerId: z.string(),
  rideId: z.string(),
  pickup: LatLng,
  pickupAddress: z.string(),
  destinationAddress: z.string(),
  estimatedFareCents: MoneyCents,
  distanceToPickupMeters: z.number().int().nonnegative(),
  expiresAt: IsoDateTime,
});
export type RideOfferEvent = z.infer<typeof RideOfferEvent>;

/** `ride:offer_expired` — room `driver:{id}`. */
export const RideOfferExpiredEvent = z.object({ offerId: z.string() });
export type RideOfferExpiredEvent = z.infer<typeof RideOfferExpiredEvent>;

/**
 * `driver:location` (servidor→cliente) — rooms `ride:{id}` (pasajero) y `dispatch:{tenantId}`.
 * `rideId` solo viene si el chofer está en un viaje.
 */
export const DriverLocationEvent = z.object({
  driverId: z.string(),
  rideId: z.string().optional(),
  position: LatLng,
  heading: z.number().min(0).max(360).optional(),
});
export type DriverLocationEvent = z.infer<typeof DriverLocationEvent>;

/** `dispatch:drivers` — foto completa para el mapa de despacho. */
export const DispatchDriversEvent = z.object({ drivers: z.array(DriverPosition) });
export type DispatchDriversEvent = z.infer<typeof DispatchDriversEvent>;

// ---- Cliente → servidor ----

/** `driver:location` (chofer, cada ~4 s, sin ack). */
export const DriverLocationPayload = z.object({
  position: LatLng,
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().nonnegative().optional(),
});
export type DriverLocationPayload = z.infer<typeof DriverLocationPayload>;

/** `driver:set_availability` (con ack `SocketAck`). */
export const SetAvailabilityPayload = z.object({ available: z.boolean() });
export type SetAvailabilityPayload = z.infer<typeof SetAvailabilityPayload>;

/** `ride:offer_response` (con ack `SocketAck`). */
export const OfferResponsePayload = z.object({ offerId: z.string().min(1), accept: z.boolean() });
export type OfferResponsePayload = z.infer<typeof OfferResponsePayload>;

// ---- Mapas evento → esquema (validación en runtime) ----

export const ServerToClientSchemas = {
  'ride:status': RideStatusEvent,
  'ride:offer': RideOfferEvent,
  'ride:offer_expired': RideOfferExpiredEvent,
  'driver:location': DriverLocationEvent,
  'dispatch:drivers': DispatchDriversEvent,
} as const;

export const ClientToServerSchemas = {
  'driver:location': DriverLocationPayload,
  'driver:set_availability': SetAvailabilityPayload,
  'ride:offer_response': OfferResponsePayload,
} as const;

// ---- Interfaces tipadas para Socket.IO (`Server<C2S, S2C>` / `Socket<S2C, C2S>`) ----

export type SocketAckCallback = (r: SocketAck) => void;

export interface ServerToClientEvents {
  'ride:status': (p: RideStatusEvent) => void;
  'ride:offer': (p: RideOfferEvent) => void;
  'ride:offer_expired': (p: RideOfferExpiredEvent) => void;
  'driver:location': (p: DriverLocationEvent) => void;
  'dispatch:drivers': (p: DispatchDriversEvent) => void;
}

export interface ClientToServerEvents {
  'driver:location': (p: DriverLocationPayload) => void;
  'driver:set_availability': (p: SetAvailabilityPayload, ack: SocketAckCallback) => void;
  'ride:offer_response': (p: OfferResponsePayload, ack: SocketAckCallback) => void;
}

export type ServerToClientEventName = keyof ServerToClientEvents;
export type ClientToServerEventName = keyof ClientToServerEvents;

// Garantiza en compilación que interfaces y mapas de esquemas no se desincronicen.
type _CheckS2C = {
  [K in ServerToClientEventName]: Parameters<ServerToClientEvents[K]>[0] extends z.infer<(typeof ServerToClientSchemas)[K]>
    ? z.infer<(typeof ServerToClientSchemas)[K]> extends Parameters<ServerToClientEvents[K]>[0]
      ? true
      : never
    : never;
};
type _CheckC2S = {
  [K in ClientToServerEventName]: Parameters<ClientToServerEvents[K]>[0] extends z.infer<(typeof ClientToServerSchemas)[K]>
    ? z.infer<(typeof ClientToServerSchemas)[K]> extends Parameters<ClientToServerEvents[K]>[0]
      ? true
      : never
    : never;
};
export type __EventSchemasInSync = [_CheckS2C, _CheckC2S] extends [Record<ServerToClientEventName, true>, Record<ClientToServerEventName, true>]
  ? true
  : never;
const _eventSchemasInSync: __EventSchemasInSync = true;
void _eventSchemasInSync;
