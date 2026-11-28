import { buildShareBarSegments } from './share-bar.helper';

describe('buildShareBarSegments', () => {
  it('converts ratios to percent widths', () => {
    expect(
      buildShareBarSegments([
        { value: 0.6, tone: 'primary', label: 'A' },
        { value: 0.4, tone: 'muted' },
      ]),
    ).toEqual([
      { value: 0.6, tone: 'primary', label: 'A', width: 60 },
      { value: 0.4, tone: 'muted', width: 40 },
    ]);
  });

  it('clamps invalid and overflowing values', () => {
    expect(
      buildShareBarSegments([
        { value: 1.5, tone: 'primary' },
        { value: 0.2, tone: 'secondary' },
        { value: -1, tone: 'muted' },
        { value: Number.NaN, tone: 'warning' },
      ]).map((segment) => segment.width),
    ).toEqual([100, 0, 0, 0]);
  });
});
