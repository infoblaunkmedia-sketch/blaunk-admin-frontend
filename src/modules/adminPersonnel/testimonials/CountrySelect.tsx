import React from 'react';
import { countryNameFromCode, fetchCountries, type CountryOption } from './countries.service';

const fieldClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

type CountrySelectProps = {
  value: string;
  onChange: (countryName: string) => void;
  disabled?: boolean;
};

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, disabled }) => {
  const [countries, setCountries] = React.useState<CountryOption[]>([]);
  const [search, setSearch] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  const legacyMappedRef = React.useRef(false);

  React.useEffect(() => {
    void fetchCountries()
      .then((list) => {
        setCountries(list);
      });
  }, []);

  React.useEffect(() => {
    legacyMappedRef.current = false;
  }, [value]);

  React.useEffect(() => {
    setSearch(value);
  }, [value]);

  React.useEffect(() => {
    if (legacyMappedRef.current || !value || value.length !== 2 || !countries.length) return;
    const name = countryNameFromCode(value, countries);
    if (name) {
      legacyMappedRef.current = true;
      onChange(name);
    }
  }, [value, countries, onChange]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, search]);

  const showLegacy =
    value &&
    value.length === 2 &&
    !countries.some((c) => c.name === value || c.iso2.toLowerCase() === value.toLowerCase());

  return (
    <div className="relative space-y-2">
      <input
        className={fieldClass}
        value={search}
        placeholder="Search & select country…"
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
          if (!countries.some((c) => c.name === search)) {
            setSearch(value);
          }
        }}
        onChange={(e) => {
          const next = e.target.value;
          setSearch(next);
          setOpen(true);
        }}
        disabled={disabled}
        required
      />
      {open ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-300 bg-white shadow-lg">
          {showLegacy ? (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearch(value.toUpperCase());
                setOpen(false);
              }}
            >
              {value.toUpperCase()} (legacy code)
            </button>
          ) : null}
          {filtered.slice(0, 150).map((c) => (
            <button
              key={c.iso2}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(c.name);
                setSearch(c.name);
                setOpen(false);
              }}
            >
              {c.name}
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
