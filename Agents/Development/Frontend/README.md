# Dubai Police Orchestration Workspace

Frontend prototype located in `Development/Frontend`, based on `Define/orchestration_agent.md` and the React frontend standards. Uses fictional, masked data only; it is not an official or live police service.

## Run locally

Use Node 24 (the verified development environment).

```bash
npm ci
npm run dev
```

Open the address printed by Vite, normally `http://localhost:5173`. The default route redirects to login. Restart Vite after configuration changes.

```bash
npm run build    # strict TypeScript check and production bundle
npm test         # Vitest + React Testing Library + jest-axe
npm run lint     # Oxlint
npm run format   # Prettier
npm run preview  # preview the production bundle
```

## Login and role access

Select a demo account on the login page to fill the form, then click **Sign in to dashboard**. All demo accounts use password **`Demo@2026`**. These are public prototype credentials, not real accounts. A role is assigned by the mock login service, not selected after login.

| Role | Demo email | Accessible data | Review permissions |
| --- | --- | --- | --- |
| Commanding Officer | command@demo.local | All seven capabilities | Approve / return pending recommendations |
| Intake Officer | intake@demo.local | e-Crime, Smart Police Stations | Within permitted areas |
| Fraud Investigator | fraud@demo.local | e-Crime, Anti-Fraud, SARAAB | Within permitted areas |
| Control Room Officer | dispatch@demo.local | Oyoon, MOI coordination | Within permitted areas |
| International Liaison | liaison@demo.local | Interpol, MOI coordination | Within permitted areas |
| Read-only Auditor | audit@demo.local | All seven capabilities | No mutations |

This is a proposed role matrix because the source requirements do not prescribe specific role assignments. Change it centrally in `src/helpers/config/accessConfig.ts` after confirming the operational policy.

## Implemented workflows

- Separate login and protected dashboard routes with logout and a 30-minute expiry timer. Sessions are held in memory and end on refresh.
- Overview displays all seven capabilities. Unauthorised areas are marked restricted and expose no case counts or records.
- Capability routes: `/dashboard/ecrime`, `/dashboard/antifraud`, `/dashboard/saraab`, `/dashboard/oyoon`, `/dashboard/interpol`, `/dashboard/sps`, `/dashboard/moi`.
- Fourteen fictional records, two per capability, with role-scoped counts, priority metrics and a searchable/filterable case queue.
- Case briefs include indicators, agent findings, team, emirates, simulated evidence/confidence and review targets.
- Seven pending recommendations can be approved or returned by authorised roles after a 10–500 character review note. Review receipts appear in the case detail and update the metrics. Reviews remain in memory while navigating this dashboard, and reset on logout or reload.
- Direct navigation to a restricted or unknown capability shows an access-denied message without case data.
- Responsive navigation, semantic form labels, keyboard-operable controls, visible focus indicators, reduced-motion support, live feedback and automated accessibility tests.

## Architecture

```text
src/
├── ui/
│   ├── navigations/Router.tsx        # routes, auth guard, session expiry
│   ├── screens/
│   │   ├── LoginScreen/             # presentation + .vm.ts login logic
│   │   └── Dashboard/               # presentation + .vm.ts case/review logic
│   └── reusables/ErrorBoundary/
├── services/
│   ├── bff/BffAdapter.ts            # reserved HTTPS fetch adapter, unused by demo
│   ├── screens/dashboardScreenService/ # interface + role-scoped mock reads
│   ├── domains/caseDomainService/   # interface + permission-checked mock reviews
│   └── platform/
│       ├── authService/             # interface + mock login
│       └── demoDataService/         # fictional records
├── store/                          # global auth state, typed Redux hooks
├── types/orchestration/            # business objects
├── helpers/                        # access policy, formatting, ServiceResult
└── test/                           # shared test setup
```

Views contain presentation; ViewModels own business/state logic; services return `ServiceResult<T>`. Internal imports use `@/` and explicit extensions, without barrel exports. Screen-specific sections remain inside the screen file. Tailwind 3.4 is deliberately retained to match the existing PostCSS configuration; scoped workspace styles use a green/gold visual system.

## Security and production limitations

**Browser-only login and RBAC are not security boundaries.** The mock data and roles ship in the frontend bundle and can be modified by a browser user. Do not connect real police data to this prototype without a backend that authenticates and authorises every request and filters all responses server-side.

Before production:

1. Replace mock login with an approved identity provider and server-validated roles. Use secure HttpOnly sessions, MFA, session invalidation and CSRF protection as applicable.
2. Implement screen/domain BFF endpoints with record-, emirate- and action-level server-side permissions. Do not trust role values from the client.
3. Generate BFF request/response types from the actual OpenAPI contract into `services/generated/bff.types.gen.ts`; no backend contract has been invented for this demo.
4. Validate response schemas, add central redacted telemetry and durable tamper-evident evidence/audit records.
5. Integrate each external capability through approved backend services. None of the seven integrations is connected here.
6. Apply deployment CSP/security headers, HTTPS, dependency remediation and operational/legal review. Automated axe checks are not a complete WCAG certification; manual keyboard, screen-reader, contrast and responsive browser testing are still required.

Approvals here only update frontend state. They do not send bank notices, publish advisories, dispatch patrols, verify identities, authorise arrests or generate a court-certified file. Scores and review targets are simulated, not verified model outputs or legally established deadlines.

## Deployment

Deploy `dist/` after `npm run build`. Configure the static server to serve `index.html` for application paths such as `/login` and `/dashboard/moi`, while preserving asset and API routes. `VITE_*` values are public configuration, never secrets. The reserved BFF adapter requires `VITE_API_BASE_URL` to be an HTTPS endpoint before it can be used; the demo requires no environment variables.

## Documentation references

- React Router declarative navigation: https://reactrouter.com/api/hooks/useNavigate
- Vitest configuration: https://vitest.dev/config/
- Local standards: `../../Code Standards/Frontend Standards/.kiro/steering/`
