import React from 'react';
import { fetchActiveCountries, type CountryRecord } from '../services/countries.service';

export function useCountries() {
  const [countries, setCountries] = React.useState<CountryRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      setCountries(await fetchActiveCountries());
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const countryNames = React.useMemo(
    () => countries.map((c) => c.country),
    [countries],
  );

  return { countries, countryNames, loading, reload };
}
