const globals = require('globals');
const pluginJs = require('@eslint/js');
const { configs: tseslintConfigs } = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.browser,
    },
    // Directly include recommended configs
    ...pluginJs.configs.recommended,
    ...tseslintConfigs.recommended,
    rules: {
      // Your custom rules here
    },
  },
];
