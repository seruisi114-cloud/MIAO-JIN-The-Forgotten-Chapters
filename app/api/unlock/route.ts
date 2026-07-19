import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LOCAL_DEVELOPMENT_KEY = "1234567890";

function keysMatch(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const configuredKey = process.env.SITE_ACCESS_KEY;
  const expectedKey = configuredKey || (process.env.NODE_ENV === "development" ? LOCAL_DEVELOPMENT_KEY : "");

  if (!expectedKey) {
    return NextResponse.json(
      { ok: false, reason: "not-configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let candidate = "";
  try {
    const body = (await request.json()) as { key?: unknown };
    candidate = typeof body.key === "string" ? body.key : "";
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid-request" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!keysMatch(candidate, expectedKey)) {
    return NextResponse.json(
      { ok: false, reason: "invalid-key" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
