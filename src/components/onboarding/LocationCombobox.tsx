import { useState, useMemo, useCallback } from "react";
import { ChevronsUpDown, Check, MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { countries, countryAliases } from "@/data/countries";
import { searchCities, getCitiesByCountry, type City } from "@/data/cities";

// ─── Country Combobox ───────────────────────────────────────────────

interface CountryComboboxProps {
  value: string;
  onChange: (country: string) => void;
  className?: string;
}

export function CountryCombobox({ value, onChange, className }: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase().trim();

    // Check aliases first
    const aliasMatch = countryAliases[q];

    return countries.filter((c) => {
      if (aliasMatch && c.name === aliasMatch) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q
      );
    });
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-md border px-4 text-sm",
            "bg-pearl-deep border-pearl-gold/15 text-pearl-warm font-body",
            "hover:border-pearl-gold/30 focus:border-pearl-gold/40 focus:outline-none focus:ring-1 focus:ring-pearl-gold/20",
            "transition-colors duration-200",
            !value && "text-pearl-muted/50",
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="size-4 shrink-0 text-pearl-gold/40" />
            <span className="truncate">
              {value || "Search country..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-30" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-pearl-deep border-pearl-gold/20"
        align="start"
        sideOffset={4}
      >
        <Command
          className="bg-transparent"
          filter={() => 1} // We handle filtering ourselves
        >
          <CommandInput
            placeholder="Type a country name..."
            value={search}
            onValueChange={setSearch}
            className="text-pearl-warm placeholder:text-pearl-muted/50"
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="text-pearl-muted text-sm py-4">
              No country found.
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.name === value ? "" : country.name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="text-pearl-warm data-[selected=true]:bg-pearl-gold/10 data-[selected=true]:text-pearl-gold cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      value === country.name ? "opacity-100 text-pearl-gold" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{country.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── City Combobox ──────────────────────────────────────────────────

interface CityComboboxProps {
  value: string;
  onChange: (city: string, lat?: number, lng?: number) => void;
  selectedCountry?: string; // country name to filter cities
  className?: string;
}

export function CityCombobox({
  value,
  onChange,
  selectedCountry,
  className,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Resolve country code from name
  const countryCode = useMemo(() => {
    if (!selectedCountry) return undefined;
    const found = countries.find(
      (c) => c.name.toLowerCase() === selectedCountry.toLowerCase(),
    );
    return found?.code;
  }, [selectedCountry]);

  // Get initial city suggestions when country is selected
  const initialCities = useMemo(() => {
    if (!countryCode) return [];
    return getCitiesByCountry(countryCode).slice(0, 20);
  }, [countryCode]);

  // Search results
  const results = useMemo(() => {
    if (!search.trim()) return initialCities;
    return searchCities(search, countryCode, 20);
  }, [search, countryCode, initialCities]);

  // Format display: "City, State" for US cities, "City" otherwise
  const formatCity = useCallback((city: City) => {
    if (city.region) return `${city.name}, ${city.region}`;
    return city.name;
  }, []);

  // Get country name for display when no country is selected
  const getCountryName = useCallback((code: string) => {
    return countries.find((c) => c.code === code)?.name || code;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-md border px-4 text-sm",
            "bg-pearl-deep border-pearl-gold/15 text-pearl-warm font-body",
            "hover:border-pearl-gold/30 focus:border-pearl-gold/40 focus:outline-none focus:ring-1 focus:ring-pearl-gold/20",
            "transition-colors duration-200",
            !value && "text-pearl-muted/50",
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="size-4 shrink-0 text-pearl-gold/40" />
            <span className="truncate">
              {value || "Search city..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-30" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-pearl-deep border-pearl-gold/20"
        align="start"
        sideOffset={4}
      >
        <Command
          className="bg-transparent"
          filter={() => 1} // We handle filtering ourselves
        >
          <CommandInput
            placeholder={
              selectedCountry
                ? `Search cities in ${selectedCountry}...`
                : "Type a city name..."
            }
            value={search}
            onValueChange={setSearch}
            className="text-pearl-warm placeholder:text-pearl-muted/50"
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="text-pearl-muted text-sm py-4">
              {search.trim()
                ? "No city found. You can type a custom city name."
                : selectedCountry
                  ? "Start typing to search cities..."
                  : "Select a country first, or start typing..."}
            </CommandEmpty>
            <CommandGroup>
              {results.map((city) => {
                return (
                  <CommandItem
                    key={`${city.country}-${city.name}-${city.region || ""}`}
                    value={`${city.name}-${city.country}-${city.region || ""}`}
                    onSelect={() => {
                      onChange(city.name, city.lat, city.lng);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="text-pearl-warm data-[selected=true]:bg-pearl-gold/10 data-[selected=true]:text-pearl-gold cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        value === city.name ? "opacity-100 text-pearl-gold" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{formatCity(city)}</span>
                      {!selectedCountry && (
                        <span className="text-xs text-pearl-muted/60 truncate">
                          {getCountryName(city.country)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
              {/* Allow custom city entry if search doesn't match */}
              {search.trim() &&
                !results.some(
                  (c) => c.name.toLowerCase() === search.toLowerCase(),
                ) && (
                  <CommandItem
                    value={`custom-${search}`}
                    onSelect={() => {
                      onChange(search.trim());
                      setOpen(false);
                      setSearch("");
                    }}
                    className="text-pearl-warm data-[selected=true]:bg-pearl-gold/10 data-[selected=true]:text-pearl-gold cursor-pointer border-t border-pearl-gold/10 mt-1"
                  >
                    <MapPin className="mr-2 size-4 shrink-0 text-pearl-gold/40" />
                    <span>
                      Use "<span className="text-pearl-gold">{search.trim()}</span>"
                    </span>
                  </CommandItem>
                )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
