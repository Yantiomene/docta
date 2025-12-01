"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";

type PhoneFieldsProps = {
  initialCountryCode?: string;
  initialPhoneNumber?: string;
  serverError?: string;
};

export default function PhoneFields({
  initialCountryCode = "33",
  initialPhoneNumber = "",
  serverError,
}: PhoneFieldsProps) {
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState<string | undefined>(serverError);

  useEffect(() => {
    setError(serverError);
  }, [serverError]);

  const validate = () => {
    const cc = countryCode?.trim();
    const pn = phoneNumber?.trim();
    if (!cc || !pn) {
      setError("Le téléphone est requis.");
      return false;
    }
    // Disallow local numbers starting with 0 for E.164
    if (pn.startsWith("0")) {
      setError("Numéro invalide. Utilisez le format E.164 (ex: +33612345678).");
      return false;
    }
    const full = `+${cc}${pn}`;
    const e164 = /^\+[1-9]\d{6,14}$/;
    if (!e164.test(full)) {
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
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            // Re-validate on change
            validate();
          }}
          className="w-[160px]"
        >
          <option value="">Sélectionner</option>
          <option value="33">+33 (France)</option>
          <option value="32">+32 (Belgique)</option>
          <option value="41">+41 (Suisse)</option>
          <option value="352">+352 (Luxembourg)</option>
          <option value="377">+377 (Monaco)</option>
          <option value="49">+49 (Allemagne)</option>
          <option value="39">+39 (Italie)</option>
          <option value="34">+34 (Espagne)</option>
          <option value="44">+44 (Royaume-Uni)</option>
          <option value="1">+1 (USA/Canada)</option>
          <option value="213">+213 (Algérie)</option>
          <option value="212">+212 (Maroc)</option>
          <option value="216">+216 (Tunisie)</option>
          <option value="221">+221 (Sénégal)</option>
          <option value="225">+225 (Côte d’Ivoire)</option>
          <option value="237">+237 (Cameroun)</option>
          <option value="234">+234 (Nigeria)</option>
        </Select>
        <Input
          name="phone_number"
          placeholder="Numéro sans 0 initial"
          inputMode="numeric"
          pattern="[0-9]+"
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
      <p className="text-xs text-gray-500">Ex: +33 612345678 ⇒ code 33, numéro 612345678</p>
    </div>
  );
}

