import { z } from 'zod';
import { Place } from './common.js';

// Mapas (Google Maps Platform) SIEMPRE vía la api: la key de servidor nunca llega a los clientes y las respuestas
// se cachean. Pasajero y staff (despacho manual) pueden usar estos endpoints.

/**
 * Token de sesión de autocompletado (UUID v4 generado por el cliente, p. ej. `crypto.randomUUID()`).
 * Uno por "búsqueda": se manda en cada tecla de `GET /maps/places/autocomplete` y en el `GET /maps/places/:placeId`
 * final; después se genera uno nuevo. Google cobra la sesión completa como una sola petición.
 */
export const PlaceSessionToken = z.uuid();
export type PlaceSessionToken = z.infer<typeof PlaceSessionToken>;

/** `GET /maps/places/autocomplete?input=&sessionToken=` (sesgado al área de servicio del tenant). */
export const PlaceAutocompleteQuery = z.object({
  input: z.string().trim().min(1).max(200),
  sessionToken: PlaceSessionToken,
});
export type PlaceAutocompleteQuery = z.infer<typeof PlaceAutocompleteQuery>;

/** Una sugerencia del autocompletado. Para obtener coordenadas: `GET /maps/places/:placeId`. */
export const PlaceSuggestion = z.object({
  placeId: z.string(),
  /** Texto principal (nombre del lugar o calle y número). */
  description: z.string(),
  /** Texto secundario (colonia, ciudad, estado). */
  secondary: z.string().optional(),
});
export type PlaceSuggestion = z.infer<typeof PlaceSuggestion>;

/** Respuesta de `GET /maps/places/autocomplete` (máx. 5 sugerencias; puede venir vacía). */
export const PlaceAutocompleteResponse = z.array(PlaceSuggestion);
export type PlaceAutocompleteResponse = z.infer<typeof PlaceAutocompleteResponse>;

/** `GET /maps/places/:placeId?sessionToken=` — el mismo token de la sesión de autocompletado (cierra la sesión). */
export const PlaceDetailsQuery = z.object({
  sessionToken: PlaceSessionToken.optional(),
});
export type PlaceDetailsQuery = z.infer<typeof PlaceDetailsQuery>;

/** Respuesta de `GET /maps/places/:placeId`: un `Place` con `placeId` siempre presente. */
export const PlaceDetails = Place.extend({ placeId: z.string() });
export type PlaceDetails = z.infer<typeof PlaceDetails>;

/**
 * `GET /maps/reverse-geocode?lat=&lng=` → `Place` (pin del mapa → dirección). Los query params llegan como
 * string y se coaccionan. La respuesta conserva el `lat`/`lng` pedidos; `address` es la dirección más cercana.
 */
export const ReverseGeocodeQuery = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});
export type ReverseGeocodeQuery = z.infer<typeof ReverseGeocodeQuery>;

/** Respuesta de `GET /maps/reverse-geocode`. */
export const ReverseGeocodeResponse = Place;
export type ReverseGeocodeResponse = z.infer<typeof ReverseGeocodeResponse>;
