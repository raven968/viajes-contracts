# contracts — `@viajes/contracts`

Fuente única de tipos compartidos entre `api`, `app-pasajero`, `app-chofer` y `admin` (ver `../CLAUDE.md`).
La api es la fuente de verdad del wire: si algo existe en la api, el contrato refleja lo que la api hace.

**Requiere zod 4** (`peerDependencies.zod: ^4.0.0`); se usan APIs de zod 4 (`z.enum(objeto)`, `z.iso.datetime()`, `z.email()`, `z.url()`, `z.uuid()`).

## Archivos (`src/`, todo se re-exporta desde `index.ts`)

- `enums.ts` — enums de dominio como objeto const + tipo + esquema Zod `XxxSchema` (`RideStatus`, `RideStatusSchema`, ...).
  Valores snake_case (los mismos de los enums de Prisma y del wire).
- `common.ts` — `MoneyCents`, `SignedCents`, `IsoDateTime`, `LatLng`, `Place`, `PhoneMx`, `PaginationQuery`, `Paginated()`, `HealthResponse`.
- `errors.ts` — contrato de error: `ApiErrorCode` (const + `ApiErrorCodeSchema`), `ApiError`
  `{ statusCode, code, message, details? }`, `ApiErrorDetails` (`issues?`, `retryAfterSeconds?`), `ApiErrorIssue`, `isApiError()`.
  Toda respuesta 4xx/5xx de la api tiene esta forma; los clientes deciden por `code`, nunca por `message`.
  Código nuevo en la api ⇒ agregarlo aquí primero.
- `auth.ts` — OTP, staff login, refresh/logout, `Principal`, perfiles y `/auth/me`: `PassengerMeResponse`,
  `DriverMeResponse`, `StaffMeResponse` con discriminador **top-level `typ`** y `MeResponse = z.discriminatedUnion('typ', ...)`.
- `tenants.ts` — `TenantSettings`, `TenantBranding`, `CreateTenantDto`, `PublicTenant`, `Tenant`,
  `TenantCurrentSettings` (`GET /tenants/current/settings`, staff).
- `app-config.ts` — `TenantAppConfig` (forma canónica de `tenants/<slug>.json` de app-pasajero/app-chofer),
  `TenantAppColors`, `TenantAppAssets`, `MapRegion`. El `app.config.ts` de Expo puede importarlo
  (el loader de Expo resuelve `@viajes/contracts` → `dist/index.cjs`; probado con `@expo/config` evalConfig).
- `fares.ts` — cotización (`FareQuoteRequest`/`FareQuote` con `FareBreakdown`, `FareQuoteZone`), `FareConfig`
  (incluye `roundingCents`), `UpdateFareConfigDto`, `FareZone`.
- `maps.ts` — mapas vía api: `PlaceSessionToken` (UUID del cliente, compartido por autocompletado y detalles),
  `PlaceAutocompleteQuery`/`PlaceSuggestion`/`PlaceAutocompleteResponse`, `PlaceDetailsQuery`/`PlaceDetails`,
  `ReverseGeocodeQuery`/`ReverseGeocodeResponse`.
- `rides.ts` — `CreateRideDto`, `RideSummary`, `RideDriver`, `VehicleSummary`, `RideListQuery`.
- `drivers.ts` — `DriverListItem`, `DriverPosition`.
- `ledger.ts` — `LedgerEntry`, `DriverDebt`.
- `dispatch.ts` — `CreateDispatchRideDto`, KPIs (`TenantKpis`, `PlatformKpis`).
- `events.ts` — Socket.IO: esquemas Zod de cada payload, `SocketHandshakeAuth` (`{ token } | { ticket }`, + `tenantId?`),
  `RealtimeTicket` (`POST /realtime/ticket`), `SocketAck`, `SocketRooms`,
  mapas `ServerToClientSchemas`/`ClientToServerSchemas` y las interfaces `ServerToClientEvents`/`ClientToServerEvents`
  derivadas de ellos (hay un chequeo en compilación que impide que se desincronicen).
- `routes.ts` — `ApiRoutes`: lista canónica de rutas REST (`ApiRoutes.auth.otpRequest('driver')` → `/auth/driver/otp/request`)
  y `ApiHeaders`. Las rutas que la api aún no implementa llevan `/** @planned */`; al implementarlas en la api, quitar la marca.
  Clientes y api deben usar `ApiRoutes` en vez de strings sueltos.
  `ApiRouteTemplates` = las mismas rutas como plantillas Nest/Express (`'/auth/:subject/otp/request'`) para los
  decoradores de la api (`@Controller()` + `@Post(ApiRouteTemplates.auth.otpRequest)`). Un chequeo de tipos
  (`__RouteTemplatesInSync`) rompe `pnpm typecheck` si una ruta o clave no coincide entre ambos: al agregar una
  ruta, agregarla en los dos.

## Reglas

- Solo tipos/esquemas puros: nada de I/O, nada de dependencias de runtime salvo `zod` (peer).
- Dinero en centavos enteros (`*Cents`), ids como string, fechas ISO (`IsoDateTime`).
- Cada esquema exporta el valor Zod y el tipo inferido con el mismo nombre (`export const X = z.object(...)`, `export type X = z.infer<typeof X>`).
- Ruta o evento nuevo ⇒ agregarlo aquí primero (`routes.ts` / `events.ts`), luego api, luego clientes.
- Cambio incompatible ⇒ subir versión menor (0.x) y crear tag `vX.Y.Z`; actualizar consumidores en el mismo esfuerzo.

## Build

- `pnpm typecheck` / `pnpm build`: tsup genera ESM + CJS en `dist/` (la api NestJS consume CJS) y
  `tsc --emitDeclarationOnly` los `.d.ts` (tsup `--dts` no funciona con TypeScript 7).
- CI: `.github/workflows/ci.yml` (Node 22, pnpm install, typecheck, build).
