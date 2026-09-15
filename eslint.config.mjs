import pluginVue from 'eslint-plugin-vue';
import prettierConfig from '@vue/eslint-config-prettier';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default withVueTs(
  {
    rootDir: import.meta.dirname,
  },
  {
    name: 'anella/ignores',
    ignores: [
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'tmp/**',
    ],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    name: 'anella/rules',
    rules: {
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
  prettierConfig,
);
