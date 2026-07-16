/**
 * Shortens a Stellar public key or contract address to a readable format: GAAA...AAAA
 * @param address The Stellar public key or contract address
 */
export function shortenAddress(address: string | null): string {
  if (!address) return "Not Connected";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

/**
 * Formats an XLM or token balance to a fixed number of decimal places.
 * @param balance The raw balance string
 * @param decimals Number of decimal places to keep
 */
export function formatBalance(balance: string | number, decimals: number = 2): string {
  const parsed = typeof balance === "string" ? parseFloat(balance) : balance;
  if (isNaN(parsed)) return "0.00";
  return parsed.toFixed(decimals);
}

/**
 * Formats a date string to a localized short date.
 * @param dateStr ISO date string or timestamp
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
