import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtMoney(n: number): string {
  return "$" + Math.round(n || 0).toLocaleString();
}

export function fmtInr(n: number): string {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}
