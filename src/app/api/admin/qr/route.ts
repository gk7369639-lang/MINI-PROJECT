import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const user = getSessionUser(userId);

    if (
      !user ||
      (user.role !== "ADMIN" &&
        user.role !== "QUERY_SYSTEM_ADMIN" &&
        user.role !== "FACULTY" &&
        user.role !== "STAFF")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized access to QR code management." }, { status: 403 });
    }

    const configs = db.getQRCodes();

    // Enrich configs with data URLs
    const enriched = await Promise.all(
      configs.map(async (cfg) => {
        try {
          const dataUrl = await QRCode.toDataURL(cfg.target_url, {
            errorCorrectionLevel: "H",
            margin: 2,
            scale: 8,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
          });
          return { ...cfg, qr_data_url: dataUrl };
        } catch {
          return { ...cfg, qr_data_url: null };
        }
      })
    );

    return NextResponse.json({ success: true, qr_codes: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = getSessionUser(userId);

    if (
      !user ||
      (user.role !== "ADMIN" &&
        user.role !== "QUERY_SYSTEM_ADMIN")
    ) {
      return NextResponse.json({ success: false, error: "Administrative rights required to register QR codes." }, { status: 403 });
    }

    const body = await req.json();
    const { title, building, room, baseUrl } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Title must be at least 3 characters." }, { status: 400 });
    }

    // Determine host origin for target URL
    const origin = baseUrl || req.nextUrl.origin || "https://sqrp.nite.edu.in";
    const params = new URLSearchParams();
    if (building) params.set("building", building.trim());
    if (room) params.set("room", room.trim());

    const queryString = params.toString();
    const targetUrl = `${origin}/student/new-query${queryString ? `?${queryString}` : ""}`;

    const newConfig = db.createQRCode({
      title: title.trim(),
      targetUrl,
      building: building?.trim(),
      room: room?.trim(),
    });

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      scale: 8,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      success: true,
      qr_code: {
        ...newConfig,
        qr_data_url: qrDataUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
