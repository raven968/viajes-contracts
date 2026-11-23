import { z } from 'zod';
import { PhoneMx } from './common.js';
import { DriverStatusSchema, StaffRoleSchema, SubjectType, SubjectTypeSchema } from './enums.js';

// ---- Pasajero / chofer (OTP) — `POST /auth/:subject/otp/{request,verify}` ----

export const RequestOtpDto = z.object({ phone: PhoneMx });
export type RequestOtpDto = z.infer<typeof RequestOtpDto>;

export const VerifyOtpDto = RequestOtpDto.extend({ code: z.string().length(6) });
export type VerifyOtpDto = z.infer<typeof VerifyOtpDto>;

/** Respuesta 202 de `POST /auth/:subject/otp/request`. */
export const OtpRequested = z.object({ expiresInSeconds: z.number().int() });
export type OtpRequested = z.infer<typeof OtpRequested>;

/** Respuesta de otp/verify, staff/login y refresh. */
export const AuthTokens = z.object({ accessToken: z.string(), refreshToken: z.string() });
export type AuthTokens = z.infer<typeof AuthTokens>;

// ---- Staff (email + password) — `POST /auth/staff/login` ----

export const StaffLoginDto = z.object({
  /** Se normaliza a minúsculas (el email del staff es único global). */
  email: z.email('Correo inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(200),
});
export type StaffLoginDto = z.infer<typeof StaffLoginDto>;

/** El login de staff devuelve solo tokens; el perfil se pide a `GET /auth/me`. */
export const StaffLoginResponse = AuthTokens;
export type StaffLoginResponse = AuthTokens;

// ---- Sesión — `POST /auth/refresh`, `POST /auth/logout` (204) ----

export const RefreshTokenDto = z.object({ refreshToken: z.string().min(1) });
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

// ---- `GET /auth/me` ----

/** Identidad autenticada (claims del access token). */
export const Principal = z.object({
  sub: z.string(),
  typ: SubjectTypeSchema,
  /** Tenant del sujeto; `null` solo para super_admin. */
  tid: z.string().nullable(),
  role: StaffRoleSchema.optional(),
});
export type Principal = z.infer<typeof Principal>;

export const PassengerProfile = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  isBlocked: z.boolean(),
});
export type PassengerProfile = z.infer<typeof PassengerProfile>;

export const DriverProfile = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().nullable(),
  status: DriverStatusSchema,
});
export type DriverProfile = z.infer<typeof DriverProfile>;

export const StaffProfile = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: StaffRoleSchema,
  /** `null` para super_admin (no pertenece a un tenant). */
  tenantId: z.string().nullable(),
});
export type StaffProfile = z.infer<typeof StaffProfile>;

/** Respuesta de `GET /auth/me`: unión discriminada por `principal.typ`. */
export const MeResponse = z.union([
  z.object({ principal: Principal.extend({ typ: z.literal(SubjectType.passenger) }), profile: PassengerProfile }),
  z.object({ principal: Principal.extend({ typ: z.literal(SubjectType.driver) }), profile: DriverProfile }),
  z.object({ principal: Principal.extend({ typ: z.literal(SubjectType.staff) }), profile: StaffProfile }),
]);
export type MeResponse = z.infer<typeof MeResponse>;
