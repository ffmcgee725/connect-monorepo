import base, { createConfig } from '@metamask/eslint-config';
import jest from '@metamask/eslint-config-jest';
import nodejs from '@metamask/eslint-config-nodejs';
import typescript from '@metamask/eslint-config-typescript';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const NODE_LTS_VERSION = 22;
const configDirName = dirname(fileURLToPath(import.meta.url));

const config = createConfig([
  ...base,
  {
    ignores: [
      '**/dist/**',
      '**/docs/**',
      '**/coverage/**',
      'merged-packages/**',
      '.yarn/**',
      'scripts/create-package/package-template/**',
      'yarn.config.cjs',
      '.pnp.*',
    ],
  },
  {
    files: [
      '**/*.{js,cjs,mjs}',
      '**/*.test.{js,ts}',
      '**/tests/**/*.{js,ts}',
      'scripts/*.ts',
      'scripts/create-package/**/*.ts',
    ],
    extends: [nodejs],
    rules: {
      // We often use synchronous methods in scripts.
      'n/no-sync': 'off',
    },
  },
  {
    files: ['**/*.test.{js,ts}', '**/tests/**/*.{js,ts}'],
    extends: [jest],
    rules: {
      // We sometimes find conditionals to be useful, especially when mocking
      // functions.
      // Consider disabling this rule in `@metamask/eslint-config`.
      'jest/no-conditional-in-test': 'off',
    },
    settings: {
      node: {
        version: `^${NODE_LTS_VERSION}`,
      },
    },
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 2020,
    },
  },
  {
    files: ['**/*.ts'],
    extends: [typescript],
    settings: {
      node: {
        version: `^${NODE_LTS_VERSION}`,
      },
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: configDirName,
        project: './tsconfig.json',
        projectService: {
          allowDefaultProject: [
            './scripts/*.ts',
            'packages/*/stencil.config.ts',
          ],
        },
      },
    },
    rules: {
      // We sometimes use enums as substitutes for strings.
      // Consider disabling this rule in `@metamask/eslint-config`.
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['tests/setupAfterEnv/matchers.ts'],
    languageOptions: {
      sourceType: 'script',
    },
  },
  // This should really be in `@metamask/eslint-config-typescript`
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'warn',
      'import-x/unambiguous': 'off',
    },
  },
  {
    files: ['scripts/*.ts'],
    rules: {
      // Scripts may be self-executable and thus have hashbangs.
      'n/hashbang': 'off',
    },
  },
  {
    files: ['**/jest.environment.js'],
    rules: {
      // These files run under Node, and thus `require(...)` is expected.
      'n/global-require': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
]);

export default config;
