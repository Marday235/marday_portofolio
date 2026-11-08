import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ConvexError } from "convex/values";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Message lisible à partir d'une erreur Convex. */
export function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data);
  if (e instanceof Error) return e.message;
  return "Une erreur est survenue.";
}

/** Lien wa.me à partir d'un numéro saisi librement (+237 6 ...). */
export function whatsappLink(phone: string, text?: string): string | null {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
