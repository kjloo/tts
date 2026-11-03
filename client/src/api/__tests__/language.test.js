import { describe, it, expect, vi } from 'vitest';
import { fetchLanguages } from '../language.js';

describe('fetchLanguages', () => {
  it('fetches languages successfully', async () => {
    const mockLanguages = [
      'English',
      'Chinese',
      'Japanese',
      'Korean',
      'German',
      'French',
      'Spanish',
      'Italian',
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ languages: mockLanguages }),
      }),
    );

    const result = await fetchLanguages();
    expect(result).toEqual(mockLanguages);
    expect(global.fetch).toHaveBeenCalledWith('/api/languages/');
  });

  it('throws error on failed fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      }),
    );

    await expect(fetchLanguages()).rejects.toThrow('Failed to fetch languages');
  });

  it('returns empty list when no languages field present', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    const result = await fetchLanguages();
    expect(result).toEqual([]);
  });
});
