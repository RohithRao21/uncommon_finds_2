export const INR_TO_USD_RATE = 83;

export function formatINR(amount: number): string {
  const isWhole = amount % 1 === 0;
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUSD(amountInINR: number): string {
  const usd = amountInINR / INR_TO_USD_RATE;
  return `$${usd.toFixed(2)}`;
}
