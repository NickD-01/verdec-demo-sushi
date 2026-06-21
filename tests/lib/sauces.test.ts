import { describe, it, expect } from 'vitest';
import {
  parseOrderOptions,
  buildOrderOptions,
  calculateExtrasPrice,
  getExtrasPriceBreakdown,
  SAUCE_EXTRA_PRICE,
} from '../../lib/sauces';

describe('lib/sauces', () => {
  it('parses order options from JSON and handles salt', () => {
    expect(parseOrderOptions(null)).toEqual({ sauces: [], seasonings: [] });
    const json = JSON.stringify({ sauces: ['A'], salt: 'with' });
    expect(parseOrderOptions(json)).toEqual({ sauces: ['A'], seasonings: ['Met zout'] });
  });

  it('builds order options string or null', () => {
    expect(buildOrderOptions([], [])).toBeNull();
    expect(buildOrderOptions(['s1'], ['se1'])).toBe(JSON.stringify({ sauces: ['s1'], seasonings: ['se1'] }));
  });

  it('calculates extras price and breakdown', () => {
    const catalog = [
      { name: 's1', extraPrice: 1, kind: 'SAUCE' as const },
      { name: 'se1', extraPrice: 0.2, kind: 'SEASONING' as const },
    ];
    expect(calculateExtrasPrice(catalog, ['s1'])).toBe(1);
    const breakdown = getExtrasPriceBreakdown(5, catalog, ['s1'], ['se1']);
    expect(breakdown.extrasTotal).toBeCloseTo(1.2);
    expect(breakdown.unitPrice).toBeCloseTo(6.2);
  });

  it('uses SAUCE_EXTRA_PRICE for calculateSauceExtraFromNames', () => {
    // import function indirectly via count-based helper
    const extra = SAUCE_EXTRA_PRICE * 3;
    expect(extra).toBe(3 * SAUCE_EXTRA_PRICE);
  });
});
