# contracts — `@viajes/contracts`

Fuente única de tipos compartidos entre `api`, `app-pasajero`, `app-chofer` y `admin` (ver `../CLAUDE.md`).
La api es la fuente de verdad del wire: si algo existe en la api, el contrato refleja lo que la api hace.

**Requiere zod 4** (`peerDependencies.zod: ^4.0.0`); se usan APIs de zod 4 (`z.enum(objeto)`, `z.iso.datetime()`, `z.email()`, `z.url()`, `z.uuid()`).

## Archivos (`src/`, todo se re-exporta desde `index.ts`)

- `enums.ts` — enums de dominio como objeto const + tipo + esquema Zod `XxxSchema` (`RideStatus`, `RideStatusSchema`, ...).
  Valores snake_case (los mismos de los enums de Prisma y del wire).
- `common.ts` — `MoneyCents`, `SignedCents`, `IsoDateTime`, `LatLng`, `Place`, `PhoneMx`, `PaginationQuery`, `Paginated()`, `HealthResponse`.
- `auth.ts` — OTP, staff login, refresh/logout, `Principal`, perfiles y `MeResponse` (`/auth/me`).
- `tenants.ts` — `TenantSettings`, `TenantBranding`, `CreateTenantDto`, `PublicTenant`, `Tenant`.
- `fares.ts` — cotización (`FareQuoteRequest`/`FareQuote`), `FareConfig`, `UpdateFareConfigDto`, `FareZone`.
- `rides.ts` — `CreateRideDto`, `RideSummary`, `RideDriver`, `VehicleSummary`, `RideListQuery`.
- `drivers.ts` — `DriverListItem`, `DriverPosition`.
- `ledger.ts` — `LedgerEntry`, `DriverDebt`.
- `dispatch.ts` — `CreateDispatchRideDto`, `PlaceSuggestion`, `PlaceAutocompleteQuery`, KPIs (`TenantKpis`, `PlatformKpis`).
- `events.ts` — Socket.IO: esquemas Zod de cada payload, `SocketHandshakeAuth`, `SocketAck`, `SocketRooms`,
  mapas `ServerToClientSchemas`/`ClientToServerSchemas` y las interfaces `ServerToClientEvents`/`ClientToServerEvents`
  derivadas de ellos (hay un chequeo en compilación que impide que se desincronicen).
- `routes.ts` — `ApiRoutes`: lista canónica de rutas REST (`ApiRoutes.auth.otpRequest('driver')` → `/auth/driver/otp/request`)
  y `ApiHeaders`. Las rutas que la api aún no implementa llevan `/** @planned */`; al implementarlas en la api, quitar la marca.
  Clientes y api deben usar `ApiRoutes` en vez de strings sueltos.

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
