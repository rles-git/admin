import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stations = await sql`
      SELECT
        id,
        name,
        short_name AS "shortName",
        address,
        lat,
        lng,
        plugs,
        available,
        power,
        price,
        kind,
        distance,
        minutes
      FROM public.stations
      ORDER BY id ASC
    `;

    return NextResponse.json(stations, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to fetch stations:", error);

    return NextResponse.json(
      { error: "Failed to fetch stations." },
      { status: 500 }
    );
  }
}
