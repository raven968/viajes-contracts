import { z } from 'zod';

/**
 * Enums de dominio. Cada uno se exporta como:
 * - objeto const (`RideStatus.inProgress`) + tipo unión (`RideStatus`) — para código;
 * - esquema Zod (`RideStatusSchema`) derivado del objeto — para validar en el wire.
 * Los valores son snake_case: son los mismos de la BD (enums de Prisma) y del wire.
 */

export const RideStatus = {
  requested: 'requested',
  searching: 'searching',
  accepted: 'accepted',
  driverArriving: 'driver_arriving',
  driverArrived: 'driver_arrived',
  inProgress: 'in_progress',
  completed: 'completed',
  cancelledByPassenger: 'cancelled_by_passenger',
  cancelledByDriver: 'cancelled_by_driver',
  cancelledByDispatch: 'cancelled_by_dispatch',
  noDriversFound: 'no_drivers_found',
} as const;
export type RideStatus = (typeof RideStatus)[keyof typeof RideStatus];
export const RideStatusSchema = z.enum(RideStatus);

export const TERMINAL_RIDE_STATUSES: readonly RideStatus[] = [
  RideStatus.completed,
  RideStatus.cancelledByPassenger,
  RideStatus.cancelledByDriver,
  RideStatus.cancelledByDispatch,
  RideStatus.noDriversFound,
];

export const DriverStatus = {
  pendingVerification: 'pending_verification',
  offline: 'offline',
  available: 'available',
  onRide: 'on_ride',
  blocked: 'blocked',
} as const;
export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus];
export const DriverStatusSchema = z.enum(DriverStatus);

export const PaymentMethod = { cash: 'cash', card: 'card' } as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export const PaymentMethodSchema = z.enum(PaymentMethod);

export const StaffRole = {
  superAdmin: 'super_admin',
  tenantOwner: 'tenant_owner',
  dispatcher: 'dispatcher',
} as const;
export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];
export const StaffRoleSchema = z.enum(StaffRole);

export const RideSource = { passengerApp: 'passenger_app', dispatch: 'dispatch' } as const;
export type RideSource = (typeof RideSource)[keyof typeof RideSource];
export const RideSourceSchema = z.enum(RideSource);

export const TenantStatus = { active: 'active', suspended: 'suspended' } as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];
export const TenantStatusSchema = z.enum(TenantStatus);

/** Cómo se calculó la tarifa: zona con tarifa fija o distancia + tiempo. */
export const PricingType = { zone: 'zone', distanceTime: 'distance_time' } as const;
export type PricingType = (typeof PricingType)[keyof typeof PricingType];
export const PricingTypeSchema = z.enum(PricingType);

/**
 * Movimientos del ledger chofer↔tenant.
 * `commission` aumenta la deuda (monto > 0), `settlement` la reduce (monto < 0), `adjustment` cualquiera.
 */
export const LedgerEntryType = { commission: 'commission', settlement: 'settlement', adjustment: 'adjustment' } as const;
export type LedgerEntryType = (typeof LedgerEntryType)[keyof typeof LedgerEntryType];
export const LedgerEntryTypeSchema = z.enum(LedgerEntryType);

/** Tipo de sujeto autenticado (claim `typ` del JWT). */
export const SubjectType = { passenger: 'passenger', driver: 'driver', staff: 'staff' } as const;
export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];
export const SubjectTypeSchema = z.enum(SubjectType);

/** Sujetos que entran por OTP (param `:subject` de `/auth/:subject/otp/*`). */
export const OtpSubject = { passenger: 'passenger', driver: 'driver' } as const;
export type OtpSubject = (typeof OtpSubject)[keyof typeof OtpSubject];
export const OtpSubjectSchema = z.enum(OtpSubject);
