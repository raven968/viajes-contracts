import { z } from 'zod';
import { IsoDateTime } from './common.js';
import { TenantStatusSchema } from './enums.js';

/** `tenant.settings` (JSON en BD). Los defaults se aplican al crear el tenant y al leerlo. */
export const TenantSettings = z.object({
  /** Deuda máxima del chofer antes de bloquearlo para recibir viajes (centavos MXN). */
  maxDriverDebtCents: z.number().int().nonnegative().default(50_000),
  /** Comisión por viaje en puntos base (1500 = 15%). */
  commissionBps: z.number().int().min(0).max(10_000).default(1500),
  offerTimeoutSeconds: z.number().int().positive().default(15),
  maxOfferAttempts: z.number().int().positive().default(5),
  searchRadiusMeters: z.number().int().positive().default(5000),
});
export type TenantSettings = z.infer<typeof TenantSettings>;

/** `tenant.branding` (JSON en BD). */
export const TenantBranding = z.object({
  displayName: z.string().min(1).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  logoUrl: z.url().optional(),
});
export type TenantBranding = z.infer<typeof TenantBranding>;

/** `POST /tenants` (super_admin). */
export const CreateTenantDto = z.object({
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug en kebab-case'),
  name: z.string().min(2).max(120),
  settings: TenantSettings.partial().optional(),
  branding: TenantBranding.optional(),
});
export type CreateTenantDto = z.infer<typeof CreateTenantDto>;

/** `GET /tenants/current` (público; branding para las apps). */
export const PublicTenant = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  timezone: z.string(),
  currency: z.string(),
  branding: TenantBranding,
});
export type PublicTenant = z.infer<typeof PublicTenant>;

/** Tenant completo (super_admin): items de `GET /tenants` y respuesta de `POST /tenants`. */
export const Tenant = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  status: TenantStatusSchema,
  timezone: z.string(),
  currency: z.string(),
  settings: TenantSettings,
  branding: TenantBranding,
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Tenant = z.infer<typeof Tenant>;
