# AI Agent Guide

This is the canonical project guide for AI coding agents (Claude Code, OpenAI Codex, opencode,
GitHub Copilot, Google Antigravity, etc.). Tool-specific config files (`CLAUDE.md`, `AGENTS.md`,
`.github/copilot-instructions.md`) all point back here — this file is the single source of truth.
Update this file when conventions change; keep the pointer files short.

## Project overview

React admin dashboard (SPA) for the TeaJul rental management system. It talks to the
`TeasJul-Backend` Spring Boot REST API.

- **Language / runtime:** JavaScript (ESM) + JSX, Node
- **Framework:** React 19 (`react`, `react-dom`)
- **Build tool:** Vite 8 (`@vitejs/plugin-react`) — `npm run dev | build | preview`
- **Routing:** React Router 7 (`react-router-dom`), `BrowserRouter`
- **Styling:** Tailwind CSS 4 via the `@tailwindcss/vite` plugin, with light/dark variants
- **HTTP client:** Axios (shared instance in `src/api/axios.js` with auth interceptors)
- **State:** Zustand 5 for global state (`src/store/`); components/hooks use local state
- **Icons:** `lucide-react`
- **Code quality:** ESLint 10 (flat config `eslint.config.js`), `npm run lint`

## Build, run, test

```bash
npm install            # install dependencies
npm run dev            # start Vite dev server (HMR)
npm run build          # production build -> dist/
npm run preview        # preview the production build
npm run lint           # run ESLint
```

- The dev/prod API base URL comes from `.env` -> `VITE_API_URL` (currently
  `http://localhost:8081/api`). Access it in code via `import.meta.env.VITE_API_URL`.
- Start the backend first (`TeasJul-Backend`) so the UI has an API to talk to.
- There is no test runner configured in this project; use `npm run lint` before considering a
  change complete.

## Folder structure

```
src/
├── main.jsx                      # React root entry (StrictMode -> <App/>)
├── App.jsx                       # wraps <AppRoutes/> in <ToastProvider/>
├── App.css / index.css           # global styles / Tailwind entry
├── api/                          # per-resource Axios API modules (x.api.js)
│   ├── axios.js                  # shared Axios instance + auth/refresh interceptors
│   ├── auth.api.js
│   ├── house.api.js
│   ├── user.api.js
│   ├── role.api.js
│   ├── permission.api.js
│   └── roomType.api.js
├── components/
│   ├── layout/                   # Layout.jsx, Navbar.jsx, Sidebar.jsx
│   ├── ui/                       # reusable UI primitives (see below)
│   ├── ProtectedRoute.jsx        # guards routes behind an access token
│   └── ui/UiShowcase.jsx         # storybook-style showcase of all UI components
├── hooks/                        # per-resource data hooks (useX.js)
│   ├── useAuth.js
│   ├── useHouses.js
│   ├── useUsers.js
│   ├── useRoles.js
│   ├── usePermissions.js
│   ├── useRoomType.js
│   ├── useSidebar.js
│   └── useTheme.js
├── page/                         # route-level pages (PascalCase)
│   ├── auth/LoginPage.jsx
│   ├── Dashboard.jsx
│   ├── Properties.jsx
│   ├── Users.jsx
│   ├── Profile.jsx
│   └── Placeholder.jsx           # stub used for unimplemented routes
├── routes/
│   └── AppRoutes.jsx             # all <Route> definitions
├── store/                        # Zustand stores (global state)
│   └── auth.store.js
└── utils/
    ├── Config.js                 # legacy hardcoded config (prefer axios + .env)
    └── icons.js                  # shared icon references
```

## Data / architecture flow

**Page -> hook -> api module -> axios -> backend.**

1. `src/page/X.jsx` renders the UI and calls a custom hook (`useX`).
2. `src/hooks/useX.js` owns local state (`data`, `loading`, `error`) plus actions
   (`fetchX`, `createX`, `updateX`, `deleteX`) wrapped in `useCallback`. It calls the matching
   `xApi` module and updates local state optimistically where sensible.
3. `src/api/x.api.js` exports a named object (e.g. `export const houseApi = { ... }`) whose
   methods call the shared `api` and return `res.data`.
4. `src/api/axios.js` attaches the `Authorization: Bearer <token>` header automatically and
   transparently refreshes on 401.

Example (`src/hooks/useHouses.js`):

```js
export function useHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHouses = useCallback(async () => {
    setLoading(true); setError(null);
    try { setHouses(await houseApi.getMyHouses()); }
    catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load.");
    } finally { setLoading(false); }
  }, []);
  // ...createHouse / updateHouse / deleteHouse update `houses` state in place

  useEffect(() => { fetchHouses(); }, [fetchHouses]);
  return { houses, loading, error, fetchHouses, createHouse, updateHouse, deleteHouse };
}
```

## API modules (x.api.js)

- Each file creates methods that wrap the shared `api` from `./axios`, e.g.
  `getMyHouses: () => api.get("/houses").then((res) => res.data)`.
- Prefer returning `res.data` at the call site of the api module so hooks/pages get the payload
  directly.
- Paginated backend responses wrap data in a `PageResponse` shape:
  `{ content: [...], page, size, totalElements, totalPages }` — read/paginate via `content` and
  `totalPages`.

## Auth

- `src/api/axios.js` is the single Axios instance. Request interceptor adds
  `Authorization: Bearer <accessToken>` from the Zustand store, skipping the login endpoint.
  Response interceptor handles 401 by calling `/v1/auth/refresh`, queues concurrent 401s, and
  redirects to `/login` on refresh failure.
- Global auth state lives in `src/store/auth.store.js` (Zustand) and persists to
  `localStorage` under the `teasjul_auth` key (`accessToken` + `user`).
- `src/hooks/useAuth.js` exposes `login`, `register`, `signOut`, plus `loading`, `error`,
  `user`, `initialized`.
- `src/components/ProtectedRoute.jsx` redirects to `/login` when there is no `accessToken`.
- All app routes live under `<ProtectedRoute><Layout>` in `src/routes/AppRoutes.jsx`. Only
  `/login` is public.

## Conventions

- **Data access:** pages never call `api` directly or talk to the backend themselves — they use
  hooks, and hooks use api modules. Keep this three-tier flow consistent.
- **Global vs local state:** use Zustand (`src/store/`) only for state shared across many
  components (currently just auth). Everything else uses local `useState` in hooks/pages.
- **Naming:**
  - Page files: `PascalCase.jsx` in `src/page/` (e.g. `Properties.jsx`).
  - Hooks: `useCamelCase.js` (e.g. `useHouses.js`), returning a object of state + actions.
  - API modules: `x.api.js` exporting a named `xApi` object.
  - UI primitives: PascalCase in `src/components/ui/` with default export.
- **Components:** function components; consistently use (and pass through) the existing
  `src/components/ui/*` primitives — do not hand-roll buttons, inputs, modals, tables, etc.
- **Refreshes / effects:** fetch-on-mount via `useEffect` in the hook; guard async updates with
  a `cancelled` flag or check the component is still mounted when setting state from promises.
- **Errors:** surface `err.response?.data?.message || err.response?.data?.error || <fallback>`
  to the user via `toast.error(...)` (from `useToast`) and/or an `<Alert variant="danger">`.

## UI primitives (src/components/ui)

`Button` — props `variant` (`primary|secondary|outline|ghost|danger|link`, default `primary`),
`size` (`sm|md|lg`), `loading`, `disabled`, `fullWidth`, `leftIcon`, `rightIcon`.

`Input` — `label`, `required`, `placeholder`, `error`, `helperText`, `leftIcon`, `rightIcon`,
`type` (set `type="number"` with `min`/`step` for numeric fields).

`Select` — `label`, `options` (`[{ value, label, disabled? }]`), `value`, `onChange`,
`error`, `placeholder` (rendered as a `disabled` first option). Note: pass options with a
`value: ""` entry for "All" filters.

`Textarea` — `label`, `rows`, `value`, `onChange`, `error`.

`Modal` — `open`, `onClose`, `title`, `description`, `size` (`sm|md|lg|xl`), `footer` (node with
Cancel + Submit buttons).

`ConfirmDialog` — `open`, `title`, `description`, `confirmText`, `cancelText`, `danger`,
`loading`, `onConfirm`, `onCancel`.

`Table` — `columns` (`[{ header, accessor, render?, className?, width? }]`), `data`,
`loading`, `emptyMessage`, `onRowClick`, `className`.

`Pagination` — `currentPage` (1-indexed), `totalPages`, `onPageChange`, `disabled`. Returns
`null` when `totalPages <= 1`. (Backend pages are 0-based; map between them at the page layer.)

`Badge` — `variant` (`default|success|warning|danger|info|neutral`).

Others: `Alert`, `Avatar`, `Card`, `Checkbox`, `Dropdown`, `EmptyState` (`icon`, `title`,
`description`, optional `action`), `IconButton`, `Label`, `Radio`, `Separator`, `Skeleton`,
`Spinner`, `Switch`, `Tabs`, `Tooltip`, `Toast`.

`useToast()` — from `src/components/ui/Toast.jsx`; returns `toast.success(title, message)`,
`toast.error`, `toast.warning`, `toast.info`. Must be used inside `<ToastProvider>` (already
wraps the app in `App.jsx`).

## Page conventions

A typical page (see `src/page/Users.jsx` and `src/page/Properties.jsx`) follows this shape:

1. **Loading state:** return skeleton layouts (`Skeleton`) matching the page structure.
2. **Header:** `h1` title + muted description, plus action buttons (`Refresh` outline, and an
   `Add/Create` primary with a `Plus` icon).
3. **Error alert:** `<Alert variant="danger" title="Error" description={error} dismissible />`.
4. **Filters:** search `<Input>` (with `leftIcon={<Search/>}`) + `<Select>` status filter;
   filter client-side with `useMemo`.
5. **Empty states:** `<EmptyState>` when there is no data (optionally with an `action`
   button) and a separate "No matches found" state when filtering yields nothing.
6. **Content:** card grid (common pattern) or `<Table>` + `<Pagination>` for tabular data.
   Row menus use a `MoreVertical` button + custom absolute-positioned dropdown.
7. **Delete:** `<ConfirmDialog>` with `danger` + `loading`; confirm calls the hook's delete and
   shows `toast.success`.
8. **Create/Edit:** a `<Modal>` with form fields; local `form` state + `formErrors` object;
   `validate()` returns whether the form is valid; on submit call the hook, `toast.success`,
   close the modal; on error `toast.error`.
9. **View details:** a read-only `<Modal>` showing structured info sections.

Styling uses Tailwind utility classes throughout with explicit light/dark variants
(`dark:` prefixes). Brand name shown in the sidebar is "RentalHub".

## Adding a new feature/resource

To wire up a new backend resource (e.g. one already exposed by the backend, like the
`utility-*` endpoints):

1. Add `src/api/<name>.api.js` exporting a `<name>Api` object of methods that call the shared
   `api` (match existing modules; return `res.data`).
2. Add `src/hooks/use<Name>.js` exposing `{ data, loading, error, fetch<Name>, create<Name>,
   update<Name>, delete<Name> }` following `useHouses.js`.
3. Add a page in `src/page/<Name>.jsx` following the page conventions above.
4. Register the route in `src/routes/AppRoutes.jsx` (inside the protected `<Layout>` block) and
   add a nav entry + icon in `src/components/layout/Sidebar.jsx` (`NAV_GROUPS`, lucide icon).
5. Never call `api` from components directly, never import `Config.js` — use the axios modules
   and `.env`.

## Notes for agents

- Don't add a new dependency or architectural layer unless the task really needs it — the
  project already has Axios, React Router, Zustand, and a full UI kit.
- Reuse `src/components/ui/*` rather than writing inline markup for controls.
- Match existing naming/spacing/style exactly (Tailwind + dark mode). Emulate `Users.jsx` /
  `Properties.jsx` when building a new CRUD page.
- Keep client-side filtering/pagination consistent with the existing pattern.
- Run `npm run lint` before considering a change complete.
- Update this file when you introduce new conventions.
