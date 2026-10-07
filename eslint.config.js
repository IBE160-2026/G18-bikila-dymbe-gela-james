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
    ignores: ['scripts/**', 'shared/**'],
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
    // AD-5: scripts/ runs in Node, never in the browser.
    files: ['scripts/**/*.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
