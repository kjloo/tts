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
      mode: 'clone',
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
          mode: 'clone',
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

  it('passes generation settings through in generate mode', async () => {
    const mockBlob = new Blob(['test audio content'], { type: 'audio/mpeg' });

    global.fetch = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              filepath: '/api/output/Design_test_01.mp3',
              filename: 'Design_test_01.mp3',
            }),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob),
        }),
      );

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');

    await generateSpeech({
      mode: 'generate',
      text: 'Hello world',
      lang: 'English',
      filename: 'test',
      instruct: 'A calm voice',
      temperature: 0.8,
      top_k: 40,
      top_p: 0.95,
      repetition_penalty: 1.1,
      max_tokens: 1024,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/generate',
      expect.objectContaining({
        body: JSON.stringify({
          mode: 'generate',
          text: 'Hello world',
          lang: 'English',
          filename: 'test',
          instruct: 'A calm voice',
          temperature: 0.8,
          top_k: 40,
          top_p: 0.95,
          repetition_penalty: 1.1,
          max_tokens: 1024,
        }),
      }),
    );
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
