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

  it('returns empty list on failed fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      }),
    );

    const result = await fetchLanguages();
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith('/api/languages/');
  });

  it('returns empty list on network error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('ECONNREFUSED')));

    const result = await fetchLanguages();
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith('/api/languages/');
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
