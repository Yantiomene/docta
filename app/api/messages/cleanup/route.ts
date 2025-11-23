import { NextRequest, NextResponse } from "next/server";

function verifyCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET || "change-me";
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(secret && token && token === secret);
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: cleanup old messages
  return NextResponse.json({ job: "messages/cleanup", ranAt: new Date().toISOString() });
}
