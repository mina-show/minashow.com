import { allCountries } from "country-region-data";

/**
 * Typed country/region lookups for the checkout shipping form.
 *
 * Data comes from `country-region-data` (ISO 3166-1/3166-2). We expose only the
 * human-readable display names — those are what we persist to the order, so the
 * cascading selects guarantee valid, typo-free country/province values.
 */

/** Country display names in the package's (alphabetical) order. */
export const countryNames: string[] = allCountries.map((c) => c[0]);

/** name → its region/province/state display names. */
const regionsByCountry = new Map<string, string[]>(
  allCountries.map((c) => [c[0], c[2].map((r) => r[0])])
);

/**
 * Region/province/state display names for a country, or `[]` if the dataset
 * has no subdivisions for it (e.g. Singapore, Vatican). Callers fall back to a
 * free-text input in that case.
 */
export function regionsForCountry(country: string): string[] {
  return regionsByCountry.get(country) ?? [];
}
