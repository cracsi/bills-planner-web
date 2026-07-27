## Getting started

### 1. Make sure the backend is running

This app expects `bills-planner-api` running locally (see that repo's README).

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Adjust `NEXT_PUBLIC_API_URL` if your backend runs on a different port/host.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the dev server

```bash
npm run dev -- -p 3001
```

(Port 3001 since the backend typically runs on 3000.)

## Design notes

- **Auth token storage:** currently stored in `localStorage` via
  `auth-context.tsx`. This is simple and fine for a portfolio project, but
  worth knowing the tradeoff: it's vulnerable to XSS in a way that an
  `httpOnly` cookie wouldn't be. A more production-hardened version would
  move token storage to a cookie set by the backend. Noted here as a
  deliberate simplification, not an oversight.
- **`api.ts`** is a thin wrapper, not a full client library — every call
  passes the token explicitly rather than relying on global state, keeping
  it framework-agnostic and easy to reason about.
- **`MetodoDePago` has no management UI yet** — the global payment-method
  catalog must currently be seeded directly via the API (e.g. Postman). The
  `cuentas-de-pago` page reads from it but can't create new global methods.

## Roadmap (not yet built)

- [ ] `MetodoDePago` management UI (currently API-only)
- [ ] Editing/deleting facturas, cuentas de pago, recordatorios (currently
      create + read only)
- [ ] Form validation feedback matching backend DTO rules more closely
- [ ] Deployment to Vercel
- [ ] Responsive/mobile polish pass
