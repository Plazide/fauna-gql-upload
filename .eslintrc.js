module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ['node_modules/', 'dist/**', 'src/__tests__/**'],
  plugins: ['jest', '@typescript-eslint', 'prettier', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    'no-underscore-dangle': 0,
    'import/extensions': 0,
    'prettier/prettier': 'error',
  },
  settings: {
    'import/resolver': {
      node: {
        paths: [''],
      },
    },
  },
};
