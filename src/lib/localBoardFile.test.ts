import { describe, expect, it } from 'vitest';
import {
  buildFilename,
  buildPngFilename,
  buildPngRelativePath,
  buildTimestampSaveTitle,
  PNG_SUBDIR,
  stripTimestampSuffix,
  suggestSaveTitle,
} from './localBoardFile';

describe('buildTimestampSaveTitle', () => {
  it('formats local date and time for filenames', () => {
    const title = buildTimestampSaveTitle(new Date(2026, 5, 22, 20, 54, 3));
    expect(title).toBe('2026-06-22_20-54-03');
    expect(buildFilename(title)).toBe('2026-06-22_20-54-03.mindstorm');
    expect(buildPngFilename(title)).toBe('2026-06-22_20-54-03.png');
    expect(buildPngRelativePath(title)).toBe('png/2026-06-22_20-54-03.png');
    expect(PNG_SUBDIR).toBe('png');
  });
});

describe('suggestSaveTitle', () => {
  const now = new Date(2026, 6, 17, 10, 21, 5);

  it('keeps prefix and replaces date/time suffix', () => {
    expect(stripTimestampSuffix('SUH2026-07-17_10-13-28')).toBe('SUH');
    expect(suggestSaveTitle('SUH2026-07-17_10-13-28', now)).toBe('SUH2026-07-17_10-21-05');
  });

  it('works with extension in previous name', () => {
    expect(suggestSaveTitle('SUH2026-07-17_10-13-28.mindstorm', now)).toBe(
      'SUH2026-07-17_10-21-05',
    );
  });

  it('pure timestamp becomes current timestamp', () => {
    expect(suggestSaveTitle('2026-07-17_10-13-28', now)).toBe('2026-07-17_10-21-05');
  });

  it('name without timestamp gets current stamp appended', () => {
    expect(suggestSaveTitle('my-board', now)).toBe('my-board2026-07-17_10-21-05');
  });

  it('empty previous name is just timestamp', () => {
    expect(suggestSaveTitle(null, now)).toBe('2026-07-17_10-21-05');
    expect(suggestSaveTitle('', now)).toBe('2026-07-17_10-21-05');
  });
});
