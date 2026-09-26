// src/components/layout/navigation/resolveSidebarNav.js
export const ADMIN_NAV = 'admin';
export const OWNER_NAV = 'owner';

const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';
const ROLE_OWNER = 'OWNER';

const ADMIN_PREFIX = '/admin';
const OWNER_PREFIX = '/owner';

// Segment-aware so a route such as /tenant/invite can never match /tenant.
const matchesPrefix = (pathname, prefix) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);
export function resolveSidebarNav(pathname = '', codes = []) {
  if (codes.includes(ROLE_SUPER_ADMIN)) return { nav: ADMIN_NAV, source: 'role' };
  if (codes.includes(ROLE_OWNER)) return { nav: OWNER_NAV, source: 'role' };
  if (matchesPrefix(pathname, ADMIN_PREFIX)) {
    return { nav: ADMIN_NAV, source: 'route' };
  }
  if (matchesPrefix(pathname, OWNER_PREFIX)) {
    return { nav: OWNER_NAV, source: 'route' };
  }
  return { nav: OWNER_NAV, source: 'default' };
}
