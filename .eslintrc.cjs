module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    // override/add rules settings here, such as:
    'vue/multi-word-component-names': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
      },
    ],
    'vue/component-tags-order': [
      'error',
      {
        order: ['script', 'template', 'style'],
      },
    ],
  },
};
