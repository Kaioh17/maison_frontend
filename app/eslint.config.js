import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

/**
 * Baseline-clean posture: this config must exit 0 on the tree as it stands today.
 * Correctness rules are errors; conventions the codebase has not finished migrating
 * to (see the maison-ui skill) are warnings so they guide without blocking.
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'node_modules/**',
      'public/**',
      'coverage/**',
      'src/sw.ts', // excluded from tsconfig too; service worker globals
      '*.config.js',
      'vite.config.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // --- Downgraded to keep the existing tree passing ---
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // TenantShell.tsx and shared.tsx intentionally export non-components.
      'react-refresh/only-export-components': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],

      // react-hooks v7 ships the React Compiler diagnostics as errors. They flag
      // real smells (~45 hits, mostly setState-in-effect in the tenant tabs), but
      // fixing them is a refactor, not a lint pass — keep them visible as warnings.
      // `rules-of-hooks` stays an error: it catches actual ordering bugs.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/rules-of-hooks': 'error',

      // Pre-existing patterns in legacy files; surfaced, not enforced yet.
      'no-case-declarations': 'warn',
      'no-useless-catch': 'warn',
      'no-useless-assignment': 'warn',
      'no-prototype-builtins': 'warn',
      // src/utils/searchSecurity.ts strips control characters on purpose.
      'no-control-regex': 'off',

      // --- Maison UI conventions (see .claude/skills/maison-ui/SKILL.md) ---
      'no-restricted-syntax': [
        'warn',
        {
          // SKILL.md §1: hardcoded hex breaks per-tenant white-labeling, because
          // RiderBrandedShell overrides --bw-* at runtime and a literal ignores it.
          selector:
            'JSXAttribute[name.name="style"] Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message:
            'Hardcoded hex color breaks tenant white-labeling. Use var(--bw-*) or getDashboardColors() — see the maison-ui skill §1.',
        },
        {
          // SKILL.md §2: hover/active/focus are pure CSS on .btn.
          selector:
            'JSXAttribute[name.name=/^onMouse(Enter|Leave|Over|Out)$/][value.expression.body.callee.name=/^set.*(Hover|Hovered)/i]',
          message:
            'Hover state belongs in CSS, not useState. Use <Button> or a :hover rule — see the maison-ui skill §2.',
        },
      ],
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: 'lucide-react',
              message: 'Use @phosphor-icons/react — see the maison-ui skill §6.',
            },
            {
              name: '@heroicons/react',
              message: 'Use @phosphor-icons/react — see the maison-ui skill §6.',
            },
          ],
        },
      ],
    },
  },

  // Tests: vitest globals, and relaxed typing for fixtures/mocks.
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/setupTests.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Node-context config files.
  {
    files: ['vite.config.ts', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: { globals: { ...globals.node } },
  }
)
