import { describe, expect, it } from 'vitest';
import { buildFilename, buildTimestampSaveTitle } from './localBoardFile';

describe('buildTimestampSaveTitle', () => {
  it('formats local date and time for filenames', () => {
    const title = buildTimestampSaveTitle(new Date(2026, 5, 22, 20, 54, 3));
    expect(title).toBe('2026-06-22_20-54-03');
    expect(buildFilename(title)).toBe('2026-06-22_20-54-03.mindstorm');
  });
});
