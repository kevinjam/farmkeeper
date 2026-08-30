'use client';

import { useEffect, useRef } from 'react';
import {
  PhoneInput,
  type CountryIso2,
  type ParsedCountry,
  type PhoneInputRefType,
} from 'react-international-phone';
import 'react-international-phone/style.css';
import './phone-input.css';
import { cn } from '@/lib/utils';
import { normalizeCountryCode } from '@/lib/countries';

const PREFERRED_COUNTRIES: CountryIso2[] = ['ug', 'ke', 'tz', 'rw', 'ng', 'gh', 'za', 'gb', 'us'];

export function toPhoneIso2(code?: string | null): CountryIso2 {
  if (!code?.trim()) return 'ug';
  const normalized = normalizeCountryCode(code).toLowerCase();
  if (!normalized || normalized === 'other') return 'ug';
  return normalized as CountryIso2;
}

/** Treat country-code-only values like "+256" as empty. */
export function phoneForSubmit(phone?: string | null): string | undefined {
  if (!phone?.trim()) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return undefined;
  return phone.trim().startsWith('+') ? phone.trim() : `+${digits}`;
}

interface PhoneNumberInputProps {
  id?: string;
  value: string;
  onChange: (phone: string, country: ParsedCountry) => void;
  defaultCountry?: string | null;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneNumberInput({
  id = 'whatsapp',
  value,
  onChange,
  defaultCountry,
  disabled,
  placeholder = '772 123456',
  className,
}: PhoneNumberInputProps) {
  const inputRef = useRef<PhoneInputRefType>(null);
  const farmCountry = toPhoneIso2(defaultCountry);
  const lastFarmCountry = useRef(farmCountry);

  useEffect(() => {
    if (lastFarmCountry.current === farmCountry) return;
    lastFarmCountry.current = farmCountry;
    if (!phoneForSubmit(value)) {
      inputRef.current?.setCountry(farmCountry, { focusOnInput: false });
    }
  }, [farmCountry, value]);

  return (
    <div className={cn('fk-phone-input', className)}>
      <PhoneInput
        ref={inputRef}
        defaultCountry={farmCountry}
        value={value}
        onChange={(phone, meta) => onChange(phone, meta.country)}
        preferredCountries={PREFERRED_COUNTRIES}
        forceDialCode
        disableCountryGuess
        allowMaskOverflow
        disabled={disabled}
        placeholder={placeholder}
        inputProps={{
          id,
          name: id,
          autoComplete: 'tel',
          inputMode: 'tel',
        }}
      />
    </div>
  );
}
