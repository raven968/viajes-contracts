import { z } from 'zod';

/**
 * Configuración de marca blanca de las apps móviles: forma canónica de `tenants/<slug>.json`
 * (idéntica en app-pasajero y app-chofer). Se valida en build-time en `app.config.ts`.
 * Nunca lleva API keys ni secretos (las keys de Maps van en variables de entorno/EAS).
 */

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex de 6 dígitos (#RRGGBB)');
const assetPath = z.string().regex(/^\.\/tenants\/.+\.png$/, 'Ruta ./tenants/<slug>/<archivo>.png');

/** Región de mapa (formato `Region` de react-native-maps). */
export const MapRegion = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  latitudeDelta: z.number().positive(),
  longitudeDelta: z.number().positive(),
});
export type MapRegion = z.infer<typeof MapRegion>;

/** `primary`/`secondary` obligatorios; el resto lo deriva el tema de cada app si falta. */
export const TenantAppColors = z.object({
  primary: hexColor,
  secondary: hexColor,
  onPrimary: hexColor.optional(),
  background: hexColor.optional(),
  surface: hexColor.optional(),
  text: hexColor.optional(),
  muted: hexColor.optional(),
  border: hexColor.optional(),
  success: hexColor.optional(),
  danger: hexColor.optional(),
});
export type TenantAppColors = z.infer<typeof TenantAppColors>;

/** Íconos y splash (rutas relativas a la raíz de la app: `./tenants/<slug>/*.png`). */
export const TenantAppAssets = z.object({
  icon: assetPath,
  splash: assetPath,
  splashBackground: hexColor,
  adaptiveIconForeground: assetPath,
  adaptiveIconBackground: assetPath,
  adaptiveIconMonochrome: assetPath,
});
export type TenantAppAssets = z.infer<typeof TenantAppAssets>;

/** `tenants/<slug>.json` de app-pasajero / app-chofer. */
export const TenantAppConfig = z.object({
  /** UUID del tenant en la api (header `X-Tenant-Id`). */
  tenantId: z.uuid(),
  /** kebab-case; coincide con el nombre del archivo. */
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug en kebab-case'),
  /** Nombre comercial del tenant. */
  name: z.string().min(1),
  /** Esquema de deep links (único por tenant y app). */
  scheme: z.string().regex(/^[a-z][a-z0-9+.-]*$/),
  ios: z.object({ bundleIdentifier: z.string().regex(/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/) }),
  android: z.object({ package: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/) }),
  /** Base URL de la api (REST + Socket.IO). */
  apiUrl: z.url(),
  colors: TenantAppColors,
  assets: TenantAppAssets,
  /** Región inicial del mapa. */
  mapInitialRegion: MapRegion,
  /** Proyecto EAS del tenant (`eas init`). Opcional hasta compilar en EAS. */
  easProjectId: z.string().optional(),
  /** Cuenta Expo dueña del proyecto EAS (si no es la del usuario que compila). */
  easOwner: z.string().optional(),
});
export type TenantAppConfig = z.infer<typeof TenantAppConfig>;
