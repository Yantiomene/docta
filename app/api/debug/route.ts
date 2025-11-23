import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.CRON_SECRET || "";
  return NextResponse.json({
    headers,
    cronSecret: isProd ? undefined : secret,
    cronSecretLength: secret.length,
  });
}
