import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const connectors = await sql`
      SELECT
        id,
        charger_id,
        connector_number,
        connector_type,
        max_power_kw,
        status,
        created_at,
        updated_at
      FROM public.connectors
      ORDER BY id ASC
    `;
return NextResponse.json(connectors, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to fetch connectors:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch connectors",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
