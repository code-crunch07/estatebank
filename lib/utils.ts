import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from a property name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate property URL path
 */
export function getPropertyUrl(property: { name: string; segment?: string }): string {
  const segment = property.segment || 'residential';
  const slug = generateSlug(property.name);
  return `/properties/${segment}/${slug}`;
}

/**
 * Format price in Indian format (Lakhs and Crores)
 */
export function formatIndianPrice(priceString: string): string {
  if (!priceString) return "Price on request";
  
  // Handle rent format: "₹50000/month (Deposit: ₹100000)"
  if (priceString.includes("/month")) {
    const rentMatch = priceString.match(/₹?([\d,]+)\/month/i);
    const depositMatch = priceString.match(/Deposit:\s*₹?([\d,]+)/i);
    
    let formattedRent = "Price on request";
    let formattedDeposit = "";
    
    if (rentMatch) {
      const rentValue = parseFloat(rentMatch[1].replace(/,/g, ''));
      formattedRent = formatPriceValue(rentValue, true); // true = isRent
    }
    
    if (depositMatch) {
      const depositValue = parseFloat(depositMatch[1].replace(/,/g, ''));
      formattedDeposit = ` (Deposit: ${formatPriceValue(depositValue, true)})`;
    }
    
    return `${formattedRent}/month${formattedDeposit}`;
  }
  
  // Extract numeric value from price string
  const numericValue = parseFloat(priceString.replace(/[₹,\sINR]/gi, ''));
  
  if (isNaN(numericValue)) {
    return priceString; // Return as-is if not a valid number
  }
  
  return formatPriceValue(numericValue);
}

/**
 * Format a numeric price value to Indian format
 * Formats: INR 90.0 Lakh, INR 3.33 Cr, or thousands for rent
 */
function formatPriceValue(value: number, isRent: boolean = false): string {
  const crore = 10000000; // 1 Crore = 10,000,000
  const lakh = 100000;    // 1 Lakh = 100,000
  const thousand = 1000;  // 1 Thousand = 1,000
  
  // For rent properties, show in thousands if less than 1 lakh
  if (isRent && value < lakh) {
    const thousands = value / thousand;
    if (thousands >= 1) {
      // Show 1 decimal place for thousands in rent
      return `INR ${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)} Thousand`;
    } else {
      return `INR ${value.toLocaleString('en-IN')}`;
    }
  }
  
  if (value >= crore) {
    const crores = value / crore;
    // Show 2 decimal places if less than 10 crores, otherwise whole number
    if (crores < 10) {
      const formatted = crores.toFixed(2).replace(/\.00$/, '');
      return `INR ${formatted} Cr`;
    } else {
      return `INR ${Math.round(crores)} Cr`;
    }
  } else if (value >= lakh) {
    const lakhs = value / lakh;
    // Show 1 decimal place for lakhs (e.g., 90.0 Lakh)
    if (lakhs < 10) {
      const formatted = lakhs.toFixed(1).replace(/\.0$/, '');
      return `INR ${formatted} Lakh`;
    } else {
      // For 10+ lakhs, show 1 decimal if needed
      const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
      return `INR ${formatted} Lakh`;
    }
  } else {
    // For values less than 1 lakh, show in thousands
    const thousands = value / thousand;
    if (thousands >= 1) {
      return `INR ${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)} Thousand`;
    } else {
      return `INR ${value.toLocaleString('en-IN')}`;
    }
  }
}

