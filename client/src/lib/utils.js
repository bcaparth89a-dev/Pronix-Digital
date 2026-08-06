import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Optimizes image URLs from Cloudinary and Unsplash by injecting compression/format parameters
 * @param {string} url - The original image URL
 * @param {number} [width] - Desired image width
 * @returns {string} Optimized image URL
 */
export function optimizeImageUrl(url, width) {
  if (!url) return url;

  // Cloudinary Optimization
  if (url.includes("cloudinary.com")) {
    const match = url.match(/(.*\/upload\/)(v\d+\/)?(.*)/);
    if (match) {
      const resizePart = width ? `,w_${width}` : "";
      return `${match[1]}f_auto,q_auto${resizePart}/${match[2] || ""}${match[3]}`;
    }
  }

  // Unsplash Optimization
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("q", "75");
      if (width) {
        urlObj.searchParams.set("w", String(width));
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  return url;
}
