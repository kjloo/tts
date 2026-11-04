import { describe, it, expect, vi } from 'vitest';
import { generateSpeech } from '../generate.js';

describe('generateSpeech', () => {
  it('generates speech successfully', async () => {
    const mockFilepath = '/api/output/Fiora_test.mp3';
    const mockFilename = 'Fiora_test.mp3';
    const mockBlob = new Blob(['test audio content'], { type: 'audio/mpeg' });
    const mockUrl = 'blob:test-url';

    global.fetch = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ filepath: mockFilepath, filename: mockFilename }),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob),
        }),
      );

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);

    const result = await generateSpeech({
      text: 'Hello world',
      lang: 'English',
      name: 'Fiora',
      ref: 'aggressive',
      filename: 'test',
    });

    expect(result).toEqual({ url: mockUrl, filename: mockFilename });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/generate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          text: 'Hello world',
          lang: 'English',
          name: 'Fiora',
          ref: 'aggressive',
          filename: 'test',
        }),
      }),
    );
    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    createObjectURLSpy.mockRestore();
  });

  it('throws error when generation fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Generation failed' }),
      }),
    );

    await expect(generateSpeech({ text: 'Hello world', lang: 'English' })).rejects.toThrow(
      'Generation failed',
    );
  });

  it('throws error when filepath is missing', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );

    await expect(generateSpeech({ text: 'Hello world', lang: 'English' })).rejects.toThrow(
      'No filepath in generation response',
    );
  });

  it('throws error when file fetch fails', async () => {
    const mockFilepath = '/api/output/test.mp3';

    global.fetch = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ filepath: mockFilepath }),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
        }),
      );

    await expect(generateSpeech({ text: 'Hello world', lang: 'English' })).rejects.toThrow(
      'Failed to fetch generated MP3',
    );
  });
});
