module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  ignorePatterns: ['public/**'],
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['jest'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'quote-props': ['error', 'as-needed'],
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-param-reassign': 'warn',
    'no-magic-numbers': [
      'warn',
      {
        ignore: [0, 1, -1],
        ignoreArrayIndexes: true,
        enforceConst: true,
      },
    ],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-magic-numbers': 'off',
      },
    },
    {
      files: ['backend/constants.js'],
      rules: {
        'no-magic-numbers': 'off', // Constants file defines magic numbers
      },
    },
    {
      files: ['frontend/**/*.js', 'public/**/*.js'],
      env: {
        browser: true,
        es2021: true,
      },
      rules: {
        'no-console': 'off', // Allow console in frontend for debugging
        'no-magic-numbers': 'off', // Allow magic numbers in frontend (timeouts, sizes, etc.)
      },
    },
  ],
};
