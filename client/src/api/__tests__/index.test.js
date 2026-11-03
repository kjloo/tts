import { describe, it, expect } from 'vitest';
import { fetchLanguages } from '../index.js';

describe('API exports', () => {
  it('exports fetchLanguages', () => {
    expect(fetchLanguages).toBeDefined();
  });
});
