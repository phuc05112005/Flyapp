import { calculateMarkup, formatBookingCode, toNumber } from './money';

describe('money utils', () => {
  it('calculates markup from percent and fixed amount', () => {
    expect(calculateMarkup(1_000_000, 7, 50_000)).toBe(120_000);
  });

  it('converts bigint values to number for API payloads', () => {
    expect(toNumber(BigInt(123))).toBe(123);
  });

  it('formats agency booking codes', () => {
    expect(formatBookingCode('a3k9p2')).toBe('VF-A3K9P2');
  });
});
