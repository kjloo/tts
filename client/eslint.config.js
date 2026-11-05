import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  react.configs.flat.recommended,
  prettierConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-undef': 'off',
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        window: true,
        document: true,
        fetch: true,
        Blob: true,
        URL: true,
        global: true,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', '.vite'],
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', '.vite'],
    files: ['**/*.test.js'],
    rules: {
      'no-undef': 'off',
    },
  },
];
