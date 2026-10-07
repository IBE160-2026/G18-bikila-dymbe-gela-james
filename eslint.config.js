import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // BMAD tooling and course documentation are not application code.
  { ignores: ['dist', 'coverage', '_bmad', '.claude', '.agents', 'ai-log', 'project-*'] },
  {
    files: ['**/*.{ts,tsx,js}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 2023,
    },
  },
  {
    // shared/ runs in both Vite and Node, so it gets neither browser nor Node globals.
    files: ['**/*.{ts,tsx,js}'],
    ignores: ['scripts/**', 'shared/**', 'tests/contract/**'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // AD-5: only the catalog script itself may import from scripts/build-catalog/.
    files: ['**/*.{ts,tsx,js}'],
    ignores: ['scripts/build-catalog/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/build-catalog/**', '**/build-catalog'], message: 'AD-5: scripts/build-catalog/ is a standalone script.' }] }],
    },
  },
  {
    // AD-5: scripts/ runs in Node, never in the browser. So do the contract tests and the recorder.
    files: ['scripts/**/*.{ts,js}', 'tests/contract/**/*.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // AD-10: src/lib/clock.ts is the only source of "now" in the app.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/clock.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'AD-10: use now() from src/lib/clock.ts instead of Date.now().',
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'AD-10: use now() from src/lib/clock.ts instead of new Date() without arguments.',
        },
      ],
    },
  },
)
