module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'next/core-web-vitals', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'coverage/',
    'public/',
    // Legacy directories (to be removed after migration verification)
    'frontend/',
    'backend/',
    'api/',
    'middleware/',
  ],
  rules: {
    'no-console': 'off', // Allow console in Next.js for logging
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // TypeScript files
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'next/core-web-vitals', 'prettier'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      // Test files
      files: ['tests/**/*.js', '**/*.test.js', '**/*.test.ts'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
