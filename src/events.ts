import type { LatLng, RideSummary } from './schemas.js';
import type { RideStatus } from './enums.js';

/**
 * Eventos de Socket.IO. Convención: `dominio:accion`.
 * Rooms: `tenant:{tenantId}`, `ride:{rideId}`, `driver:{driverId}`, `passenger:{passengerId}`, `dispatch:{tenantId}`.
 */
export interface ServerToClientEvents {
  'ride:status': (p: { rideId: string; status: RideStatus; ride: RideSummary }) => void;
  'ride:offer': (p: { offerId: string; rideId: string; pickup: LatLng; pickupAddress: string; destinationAddress: string; estimatedFareCents: number; distanceToPickupMeters: number; expiresAt: string }) => void;
  'ride:offer_expired': (p: { offerId: string }) => void;
  'driver:location': (p: { rideId: string; driverId: string; position: LatLng; heading?: number }) => void;
  'dispatch:drivers': (p: { drivers: Array<{ driverId: string; position: LatLng; status: string }> }) => void;
}

export interface ClientToServerEvents {
  'driver:location': (p: { position: LatLng; heading?: number; speed?: number }) => void;
  'driver:set_availability': (p: { available: boolean }, ack: (r: { ok: boolean; reason?: string }) => void) => void;
  'ride:offer_response': (p: { offerId: string; accept: boolean }, ack: (r: { ok: boolean; reason?: string }) => void) => void;
}
