import js from '@eslint/js'
import tsEslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

const sharedGlobals = {
  window: 'readonly',
  document: 'readonly',
  HTMLVideoElement: 'readonly',
  HTMLCanvasElement: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  console: 'readonly'
}

const jsExampleGlobals = {
  ...sharedGlobals,
  MutationObserver: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly'
}

export default [
  js.configs.recommended,

  // TypeScript configs with file targeting
  ...tsEslint.configs.recommended.map(config => ({
    ...config,
    files: ['src/**/*.ts', 'tests/**/*.ts']
  })),

  prettier,

  // TypeScript specific rules
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: sharedGlobals
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ]
    }
  },

  // example rules
  {
    files: ['example/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: jsExampleGlobals
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },

  // Ignored files
  {
    ignores: [
      'dist/',
      'node_modules/',
      'example/dist/',
      'example/node_modules/'
    ]
  }
]
