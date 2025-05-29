import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Triggers a browser download for the given data as a JSON file.
 * @param data - The data to be stringified and downloaded.
 * @param filename - The desired filename for the downloaded file (e.g., "schedule.json").
 */
export const downloadJson = (data: unknown, filename: string) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = filename;
  
  // Append to body, click, and remove (standard way to trigger download)
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link.remove(); // Clean up the link element
};
