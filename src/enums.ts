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

export const PaymentMethod = { cash: 'cash', card: 'card' } as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const StaffRole = {
  superAdmin: 'super_admin',
  tenantOwner: 'tenant_owner',
  dispatcher: 'dispatcher',
} as const;
export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export const RideSource = { passengerApp: 'passenger_app', dispatch: 'dispatch' } as const;
export type RideSource = (typeof RideSource)[keyof typeof RideSource];
