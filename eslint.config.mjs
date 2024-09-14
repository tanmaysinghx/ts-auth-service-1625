import globals from 'globals';
import pluginJs from '@eslint/js';
import { configs as tseslintConfigs } from '@typescript-eslint/eslint-plugin';

export default {
  overrides: [
    {
      files: ['**/*.{js,mjs,cjs,ts}'],
      languageOptions: {
        globals: globals.browser,
      },
      ...pluginJs.configs.recommended,
      ...tseslintConfigs.recommended,
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Add custom rules here
  },
};
