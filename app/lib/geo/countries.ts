import countryRegionData from "country-region-data/data.json";

/**
 * Typed country/region lookups for the checkout shipping form.
 *
 * Data comes from `country-region-data` (ISO 3166-1/3166-2). We expose only the
 * human-readable display names — those are what we persist to the order, so the
 * cascading selects guarantee valid, typo-free country/province values.
 *
 * We import the package's static `data.json` (not the `allCountries` named
 * export): the package ships an ESM build *and* a CJS/UMD build whose exports
 * live behind a factory call, so `import { allCountries }` resolves only under
 * ESM and throws at runtime wherever the CJS build is picked (e.g. prod). JSON
 * has one canonical shape across every resolver, so this is build-agnostic.
 */

/** Shape of each entry in `country-region-data/data.json`. */
type CountryData = {
  countryName: string;
  countryShortCode: string;
  regions: { name: string; shortCode?: string }[];
};

const allCountries = countryRegionData as CountryData[];

/** Country display names in the package's (alphabetical) order. */
export const countryNames: string[] = allCountries.map((c) => c.countryName);

/** name → its region/province/state display names. */
const regionsByCountry = new Map<string, string[]>(
  allCountries.map((c) => [c.countryName, c.regions.map((r) => r.name)])
);

/**
 * Region/province/state display names for a country, or `[]` if the dataset
 * has no subdivisions for it (e.g. Singapore, Vatican). Callers fall back to a
 * free-text input in that case.
 */
export function regionsForCountry(country: string): string[] {
  return regionsByCountry.get(country) ?? [];
}
