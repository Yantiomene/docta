"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";

type PhoneFieldsProps = {
  initialCountryIso?: CountryCode;
  initialPhoneNumber?: string;
  serverError?: string;
};

export default function PhoneFields({
  initialCountryIso = "FR",
  initialPhoneNumber = "",
  serverError,
}: PhoneFieldsProps) {
  const [countryIso, setCountryIso] = useState<CountryCode>(initialCountryIso);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState<string | undefined>(serverError);

  useEffect(() => {
    setError(serverError);
  }, [serverError]);

  const validate = () => {
    const cc = countryIso?.toString().trim();
    const pn = phoneNumber?.trim();
    if (!cc || !pn) {
      setError("Le téléphone est requis.");
      return false;
    }
    try {
      const phone = parsePhoneNumberFromString(pn, { defaultCountry: cc as CountryCode });
      if (!phone || !phone.isValid()) {
        setError("Numéro invalide. Utilisez le format E.164 (ex: +33612345678).");
        return false;
      }
    } catch {
      setError("Numéro invalide. Utilisez le format E.164 (ex: +33612345678).");
      return false;
    }
    setError(undefined);
    return true;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Téléphone (indicatif pays + numéro, requis)</label>
      <div className="flex gap-2">
        <Select
          name="country_code"
          required
          value={countryIso}
          onChange={(e) => {
            setCountryIso(e.target.value as CountryCode);
            validate();
          }}
          className="w-[200px]"
        >
          <option value="">Sélectionner</option>
          <option value="FR">+33 (France)</option>
          <option value="BE">+32 (Belgique)</option>
          <option value="CH">+41 (Suisse)</option>
          <option value="LU">+352 (Luxembourg)</option>
          <option value="MC">+377 (Monaco)</option>
          <option value="DE">+49 (Allemagne)</option>
          <option value="IT">+39 (Italie)</option>
          <option value="ES">+34 (Espagne)</option>
          <option value="GB">+44 (Royaume-Uni)</option>
          <option value="US">+1 (USA)</option>
          <option value="CA">+1 (Canada)</option>
          <option value="DZ">+213 (Algérie)</option>
          <option value="MA">+212 (Maroc)</option>
          <option value="TN">+216 (Tunisie)</option>
          <option value="SN">+221 (Sénégal)</option>
          <option value="CI">+225 (Côte d’Ivoire)</option>
          <option value="CM">+237 (Cameroun)</option>
          <option value="NG">+234 (Nigeria)</option>
        </Select>
        <Input
          name="phone_number"
          placeholder="Votre numéro (ex: 06 12 34 56 78)"
          inputMode="tel"
          required
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
          onBlur={validate}
          aria-invalid={error ? true : undefined}
          className={error ? "border-red-600" : ""}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">Saisissez le numéro national pour le pays sélectionné. Il sera normalisé au format E.164.</p>
    </div>
  );
}
