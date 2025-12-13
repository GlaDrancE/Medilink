import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format date string or Date object
export const formatDate = (date?: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};