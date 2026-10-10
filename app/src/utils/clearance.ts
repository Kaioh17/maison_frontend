/**
 * Optional, dev-only clearance checklist. `src/pages/clearance/` is gitignored, so this glob
 * resolves to nothing on a clone (and in production builds) and the route/link simply vanish.
 */
export const loadClearance = import.meta.env.DEV
  ? (Object.values(import.meta.glob('../pages/clearance/index.tsx'))[0] as
      | (() => Promise<{ default: React.ComponentType }>)
      | undefined)
  : undefined
