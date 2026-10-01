import type { CustomerDetails } from "./types";

export type FieldError = "required" | "too-short" | "invalid-email" | "invalid-phone" | "too-long";
export type DetailsErrors = Partial<Record<keyof CustomerDetails, FieldError>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateDetails(d: CustomerDetails): DetailsErrors {
  const errors: DetailsErrors = {};
  const name = d.name.trim();
  if (!name) errors.name = "required";
  else if (name.length < 2) errors.name = "too-short";

  const email = d.email.trim();
  if (!email) errors.email = "required";
  else if (!EMAIL.test(email)) errors.email = "invalid-email";

  const phone = d.phone.trim();
  const digits = phone.replace(/\D/g, "");
  if (!phone) errors.phone = "required";
  else if (!/^\+?[\d\s()\-/]+$/.test(phone) || digits.length < 7 || digits.length > 15)
    errors.phone = "invalid-phone";

  if ((d.note ?? "").length > 500) errors.note = "too-long";
  if (!d.consent) errors.consent = "required";
  return errors;
}

export const isValid = (e: DetailsErrors) => Object.keys(e).length === 0;
