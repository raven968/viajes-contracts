import type { OtpSubject } from './enums.js';

/**
 * Lista canónica de rutas REST de la api (relativas a la base URL, sin prefijo global).
 * Las marcadas con `@planned` aún no existen en la api: el contrato las reserva para que
 * los clientes (admin/apps) y la api converjan en la misma ruta.
 *
 * Los parámetros dinámicos se codifican con `encodeURIComponent`.
 */
export const ApiRoutes = {
  /** `GET` — estado de BD y Redis (`HealthResponse`). */
  health: '/health',

  auth: {
    /** `POST` `RequestOtpDto` → 202 `OtpRequested`. Requiere `X-Tenant-Id`. */
    otpRequest: (subject: OtpSubject) => `/auth/${subject}/otp/request` as const,
    /** `POST` `VerifyOtpDto` → `AuthTokens`. Requiere `X-Tenant-Id`. */
    otpVerify: (subject: OtpSubject) => `/auth/${subject}/otp/verify` as const,
    /** `POST` `StaffLoginDto` → `AuthTokens`. */
    staffLogin: '/auth/staff/login',
    /** `POST` `RefreshTokenDto` → `AuthTokens` (rota el refresh token). */
    refresh: '/auth/refresh',
    /** `POST` `RefreshTokenDto` → 204. */
    logout: '/auth/logout',
    /** `GET` (bearer) → `MeResponse`. */
    me: '/auth/me',
  },

  tenants: {
    /** `GET` (público, `X-Tenant-Id`) → `PublicTenant`. */
    current: '/tenants/current',
    /** `GET` (super_admin) → `Tenant[]`. */
    list: '/tenants',
    /** `POST` (super_admin) `CreateTenantDto` → `Tenant`. */
    create: '/tenants',
  },

  dashboard: {
    /** @planned `GET` → `TenantKpis`. */
    tenantKpis: '/dashboard/kpis',
    /** @planned `GET` (super_admin) → `PlatformKpis`. */
    platformKpis: '/admin/kpis',
  },

  rides: {
    /** @planned `POST` `CreateRideDto` → `RideSummary` (pasajero). */
    create: '/rides',
    /** @planned `GET` → `RideSummary`. */
    byId: (rideId: string) => `/rides/${encodeURIComponent(rideId)}` as const,
  },

  dispatch: {
    /** @planned `GET` `RideListQuery` → `Paginated<RideSummary>`. */
    rides: '/dispatch/rides',
    /** @planned `POST` `CreateDispatchRideDto` → `RideSummary`. */
    createRide: '/dispatch/rides',
    /** @planned `GET` → `DriverPosition[]` (foto inicial; luego `dispatch:drivers` por socket). */
    driverPositions: '/dispatch/drivers/positions',
  },

  drivers: {
    /** @planned `GET` → `DriverListItem[]`. */
    list: '/drivers',
  },

  maps: {
    /** @planned `GET` `PlaceAutocompleteQuery` → `PlaceSuggestion[]`. */
    autocomplete: '/maps/places/autocomplete',
    /** @planned `GET` `?sessionToken=` → `Place`. */
    placeDetails: (placeId: string) => `/maps/places/${encodeURIComponent(placeId)}` as const,
  },

  fares: {
    /** @planned `POST` `FareQuoteRequest` → `FareQuote`. */
    quote: '/fares/quote',
    /** @planned `GET` → `FareConfig`; `PATCH` `UpdateFareConfigDto` → `FareConfig`. */
    config: '/fares/config',
    /** @planned `GET` → `FareZone[]`. */
    zones: '/fares/zones',
  },

  ledger: {
    /** @planned `GET` → `DriverDebt[]`. */
    debts: '/ledger/debts',
    /** @planned `GET` → `LedgerEntry[]`. */
    entries: '/ledger/entries',
  },
} as const;

export type ApiRoutes = typeof ApiRoutes;

/** Headers HTTP con significado en la api. */
export const ApiHeaders = {
  /** Tenant de la petición (id UUID o slug). Obligatorio en rutas públicas de las apps. */
  tenantId: 'X-Tenant-Id',
} as const;
