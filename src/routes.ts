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
    /** `GET` (tenant_owner, dispatcher) → `TenantCurrentSettings` del tenant de la sesión. */
    currentSettings: '/tenants/current/settings',
    /** `GET` (super_admin) → `Tenant[]`. */
    list: '/tenants',
    /** `POST` (super_admin) `CreateTenantDto` → `Tenant`. */
    create: '/tenants',
  },

  realtime: {
    /** `POST` (cualquier sujeto autenticado) → 201 `RealtimeTicket` para el handshake `{ ticket }` del socket. */
    ticket: '/realtime/ticket',
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
    /** `GET` `PlaceAutocompleteQuery` (`?input=&sessionToken=`) → `PlaceAutocompleteResponse` (`PlaceSuggestion[]`). Pasajero o staff. */
    autocomplete: '/maps/places/autocomplete',
    /** `GET` `PlaceDetailsQuery` (`?sessionToken=`) → `PlaceDetails`. Pasajero o staff. */
    placeDetails: (placeId: string) => `/maps/places/${encodeURIComponent(placeId)}` as const,
    /** `GET` `ReverseGeocodeQuery` (`?lat=&lng=`) → `ReverseGeocodeResponse` (`Place`). Pasajero o staff. */
    reverseGeocode: '/maps/reverse-geocode',
  },

  fares: {
    /** `POST` `FareQuoteRequest` → 200 `FareQuote`. Pasajero o staff. */
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

/**
 * Las mismas rutas como plantillas estilo Nest/Express (`:param`), para los decoradores de la api:
 * `@Controller()` + `@Post(ApiRouteTemplates.auth.otpRequest)`. El nombre del parámetro es el que lee `@Param()`.
 * Un chequeo en compilación (abajo) garantiza que `ApiRoutes` y `ApiRouteTemplates` coinciden.
 */
export const ApiRouteTemplates = {
  health: '/health',
  auth: {
    otpRequest: '/auth/:subject/otp/request',
    otpVerify: '/auth/:subject/otp/verify',
    staffLogin: '/auth/staff/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  tenants: {
    current: '/tenants/current',
    currentSettings: '/tenants/current/settings',
    list: '/tenants',
    create: '/tenants',
  },
  realtime: {
    ticket: '/realtime/ticket',
  },
  dashboard: {
    tenantKpis: '/dashboard/kpis',
    platformKpis: '/admin/kpis',
  },
  rides: {
    create: '/rides',
    byId: '/rides/:rideId',
  },
  dispatch: {
    rides: '/dispatch/rides',
    createRide: '/dispatch/rides',
    driverPositions: '/dispatch/drivers/positions',
  },
  drivers: {
    list: '/drivers',
  },
  maps: {
    autocomplete: '/maps/places/autocomplete',
    placeDetails: '/maps/places/:placeId',
    reverseGeocode: '/maps/reverse-geocode',
  },
  fares: {
    quote: '/fares/quote',
    config: '/fares/config',
    zones: '/fares/zones',
  },
  ledger: {
    debts: '/ledger/debts',
    entries: '/ledger/entries',
  },
} as const;

export type ApiRouteTemplates = typeof ApiRouteTemplates;

// ---- Chequeo en compilación: ApiRoutes ⇔ ApiRouteTemplates ----

/** `/rides/:rideId/x` → `/rides/${string}/x`. */
type TemplateToPath<S extends string> = S extends `${infer A}:${string}/${infer B}`
  ? `${A}${string}/${TemplateToPath<B>}`
  : S extends `${infer A}:${string}`
    ? `${A}${string}`
    : S;

type RouteMatch<R, T> = R extends (...args: never[]) => infer P
  ? T extends string
    ? T extends `${string}:${string}`
      ? [P] extends [TemplateToPath<T>]
        ? true
        : false
      : false
    : false
  : R extends string
    ? [R] extends [T]
      ? [T] extends [R]
        ? true
        : false
      : false
    : R extends object
      ? T extends object
        ? RoutesMatch<R, T>
        : false
      : false;

type RoutesMatch<R, T> = [keyof R] extends [keyof T]
  ? [keyof T] extends [keyof R]
    ? { [K in keyof R & keyof T]: RouteMatch<R[K], T[K]> }[keyof R & keyof T] extends true
      ? true
      : false
    : false
  : false;

export type __RouteTemplatesInSync = RoutesMatch<ApiRoutes, ApiRouteTemplates>;
const _routeTemplatesInSync: __RouteTemplatesInSync = true;
void _routeTemplatesInSync;

/** Headers HTTP con significado en la api. */
export const ApiHeaders = {
  /** Tenant de la petición (id UUID o slug). Obligatorio en rutas públicas de las apps. */
  tenantId: 'X-Tenant-Id',
} as const;
