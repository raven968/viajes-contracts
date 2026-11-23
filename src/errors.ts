import { z } from 'zod';

/**
 * Códigos de error estables de la api (`ApiError.code`). Los clientes deciden con `code`,
 * nunca con `message` (texto para humanos, en español, puede cambiar).
 * También son el `message` del `connect_error` de Socket.IO cuando el handshake falla.
 */
export const ApiErrorCode = {
  // Genéricos (derivados del status HTTP cuando no hay uno más específico)
  badRequest: 'bad_request',
  validationFailed: 'validation_failed',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not_found',
  conflict: 'conflict',
  rateLimited: 'rate_limited',
  internalError: 'internal_error',
  // Tenant
  tenantRequired: 'tenant_required',
  tenantNotFound: 'tenant_not_found',
  tenantMismatch: 'tenant_mismatch',
  tenantSuspended: 'tenant_suspended',
  // OTP
  invalidOtp: 'invalid_otp',
  otpExpired: 'otp_expired',
  otpTooManyAttempts: 'otp_too_many_attempts',
  otpCooldown: 'otp_cooldown',
  // Sesión / cuentas
  invalidCredentials: 'invalid_credentials',
  refreshReused: 'refresh_reused',
  sessionRevoked: 'session_revoked',
  accountBlocked: 'account_blocked',
  /** Reservado (Fase 1): chofer bloqueado por deuda con el tenant. */
  driverBlocked: 'driver_blocked',
  // Mapas y cotización
  /** 422: el origen está fuera del área de servicio del tenant. */
  outsideServiceArea: 'outside_service_area',
  /** 422: no hay ruta en auto entre origen y destino. */
  noRoute: 'no_route',
  /** 503: Google Maps no respondió (timeout, cuota, error); reintentar. */
  mapsUnavailable: 'maps_unavailable',
  /** 410: la cotización venció; volver a cotizar. */
  quoteExpired: 'quote_expired',
  /** 404: la cotización no existe (o no es de este pasajero / ya se usó). */
  quoteNotFound: 'quote_not_found',
  // Tiempo real
  ticketInvalid: 'ticket_invalid',
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
export const ApiErrorCodeSchema = z.enum(ApiErrorCode);

/** Un problema de validación (`code: validation_failed`). `path` vacío = el valor completo. */
export const ApiErrorIssue = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});
export type ApiErrorIssue = z.infer<typeof ApiErrorIssue>;

/** Detalles opcionales; pueden aparecer campos nuevos (objeto abierto). */
export const ApiErrorDetails = z.looseObject({
  /** `validation_failed`: problemas por campo. */
  issues: z.array(ApiErrorIssue).optional(),
  /** `rate_limited` / `otp_cooldown`: segundos para reintentar (también va en el header `Retry-After`). */
  retryAfterSeconds: z.number().int().nonnegative().optional(),
});
export type ApiErrorDetails = z.infer<typeof ApiErrorDetails>;

/** Cuerpo de TODA respuesta de error HTTP de la api (4xx/5xx). */
export const ApiError = z.object({
  statusCode: z.number().int(),
  code: ApiErrorCodeSchema,
  message: z.string(),
  details: ApiErrorDetails.optional(),
});
export type ApiError = z.infer<typeof ApiError>;

/** true si `body` tiene forma de `ApiError` (útil en los clientes HTTP). */
export function isApiError(body: unknown): body is ApiError {
  return ApiError.safeParse(body).success;
}
