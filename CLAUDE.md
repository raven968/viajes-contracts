# contracts — `@viajes/contracts`

Fuente única de tipos compartidos entre `api`, `app-pasajero`, `app-chofer` y `admin` (ver `../CLAUDE.md`).

- `src/enums.ts` — estados de viaje/chofer, métodos de pago, roles. Valores en snake_case (son los que van a la BD y al wire).
- `src/schemas.ts` — DTOs como esquemas Zod + tipos inferidos. Dinero en centavos (`*Cents`).
- `src/events.ts` — tipado de eventos Socket.IO (`ServerToClientEvents` / `ClientToServerEvents`).

Reglas:
- Solo tipos/esquemas puros: nada de I/O, nada de dependencias de runtime salvo `zod` (peer).
- Cambio incompatible ⇒ subir versión menor (0.x) y crear tag `vX.Y.Z`; actualizar consumidores en el mismo esfuerzo.
- `pnpm build` genera ESM + CJS + d.ts en `dist/` (la api NestJS consume CJS).
