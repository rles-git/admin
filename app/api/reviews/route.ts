
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await sql`
      SELECT
        r.id,
        r.station_id,
        s.name AS station_name,
        s.short_name AS station_short_name,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at

      FROM public.reviews r

      INNER JOIN public.stations s
        ON s.id = r.station_id

      ORDER BY r.created_at DESC
    `;

    return NextResponse.json(reviews, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);

    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
