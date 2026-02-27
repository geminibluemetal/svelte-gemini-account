// eslint.config.js

import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */ export default [
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: { parserOptions: { svelteConfig } },
  },

  {
    rules: {
      // If you want ESLint to specifically enforce 2 spaces,
      // but usually 'prettier' config above handles this by disabling the rule.
      // indent: ['error', 2],
      // 'svelte/indent': ['error', { indent: 2 }],
    },
  },
];
