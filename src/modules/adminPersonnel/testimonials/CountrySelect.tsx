import React from 'react';
import { useCountries } from '../../../shared/hooks/useCountries';

const fieldClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

type CountrySelectProps = {
  value: string;
  onChange: (countryName: string) => void;
  disabled?: boolean;
};

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, disabled }) => {
  const { countryNames, loading } = useCountries();
  const [search, setSearch] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countryNames;
    return countryNames.filter((name) => name.toLowerCase().includes(q));
  }, [countryNames, search]);

  return (
    <div className="relative space-y-2">
      <input
        className={fieldClass}
        value={loading ? 'Loading…' : search}
        placeholder="Search & select country…"
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
          if (!countryNames.includes(search)) {
            setSearch(value);
          }
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        disabled={disabled || loading}
        required
      />
      {open && !loading ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-300 bg-white shadow-lg">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(name);
                setSearch(name);
                setOpen(false);
              }}
            >
              {name}
            </button>
          ))}
          {!filtered.length ? (
            <p className="px-3 py-2 text-sm text-slate-500">No countries found</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
