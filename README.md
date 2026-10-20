# Be-Electric Network Operations — Next.js prototype

A desktop-first administration dashboard recreated from the supplied Dashboard and Chargers PSD mockups. It also adapts to tablet and mobile widths.

## Run locally
1. Install Node.js 18.17 or later.
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Included
- Dashboard summary cards and illustrative chart panels
- Charger inventory with search, status tabs, station/firmware filters
- Charger details modal and add-charger demo form
- CSV export for the currently filtered charger inventory
- Sidebar navigation to prototype sections
- Responsive layout

## Important
This is a front-end prototype. All station, charger, energy, session and revenue values are sample data based on the supplied design. No database, authentication, telemetry feed, charger hardware, or live command API is connected. Form submissions and actions are demonstrations only. Replace the arrays in `app/page.tsx` and connect your API/database before production use.
