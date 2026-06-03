export function toNumber(value: bigint | number | string) {
  return typeof value === 'bigint' ? Number(value) : Number(value);
}

export function calculateMarkup(baseAmount: number, percent: number, fixedVND: number) {
  return Math.round(baseAmount * (percent / 100)) + fixedVND;
}

export function formatBookingCode(randomPart: string) {
  return `VF-${randomPart.toUpperCase()}`;
}
