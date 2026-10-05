# Smart Solar Microgrid Trading System — Web Frontend

University project frontend for the **Smart Solar Microgrid Trading System**.

## Stack

- React (JavaScript)
- Vite
- Tailwind CSS
- React Router
- Fetch API (via `src/services/api.js`)

## Important

- Frontend only — no C# backend, no MongoDB, no database code in this project.
- All data currently uses **mock data** for UI development.
- Set `USE_MOCK_DATA = false` in `src/services/api.js` when connecting to the ASP.NET Core API.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Development login (mock only)

| Role | Email | Password |
|------|-------|----------|
| Backoffice | backoffice@test.com | password123 |
| Grid Operator | operator@test.com | password123 |

These are **not** production credentials.

## Project structure

```
src/
├── components/     # Reusable UI (layout, forms, tables, common)
├── context/        # AuthContext
├── pages/          # Route pages by feature
├── routes/         # AppRoutes + ProtectedRoute
├── services/       # api.js, dataService.js, mockData.js
└── utils/          # Frontend validation helpers
```

## Connecting to the C# API later

1. Set `API_BASE_URL` in `src/services/api.js`
2. Set `USE_MOCK_DATA = false`
3. Replace mock login in `src/context/AuthContext.jsx` with `api.post('/auth/login', ...)`
4. Keep using `src/services/dataService.js` — it already calls real endpoints when mock mode is off
