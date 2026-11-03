```tsx
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sessions = await sql`
      SELECT
        cs.id,
        cs.connector_id,
        cs.external_session_id,
        cs.status,
        cs.started_at,
        cs.ended_at,
        cs.energy_kwh,
        cs.created_at,
        cs.account_id,

        c.connector_number,
        c.connector_type,

        ch.id AS charger_id,
        ch.name AS charger_name,
        ch.station_id,

        s.name AS station_name,
        s.short_name AS station_short_name

      FROM public.charging_sessions cs

      LEFT JOIN public.connectors c
        ON c.id = cs.connector_id

      LEFT JOIN public.chargers ch
        ON ch.id = c.charger_id

      LEFT JOIN public.stations s
        ON s.id = ch.station_id

      ORDER BY cs.created_at DESC
    `;

    return NextResponse.json(sessions, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });

  } catch (error) {
    console.error("Failed to load charging sessions:", error);

    return NextResponse.json(
      { error: "Failed to load charging sessions" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
```
