import { describe, expect, it } from 'vitest'
import { roleForPath } from './useRoleManifest'

describe('roleForPath', () => {
  it.each([
    ['/driver', 'driver'],
    ['/driver/login', 'driver'],
    ['/rider/dashboard', 'rider'],
    ['/riders/login', 'rider'],
    ['/booking/complete', 'rider'],
    ['/', null],
    ['/tenant/overview', null],
    ['/drivers-wanted', null],
  ])('%s -> %s', (path, role) => expect(roleForPath(path)).toBe(role))
})
