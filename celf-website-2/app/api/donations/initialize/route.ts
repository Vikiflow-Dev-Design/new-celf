import { NextResponse } from "next/server";

function getSiteUrl() {
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const local = process.env.NEXT_PUBLIC_SITE_URL;
  return local || "http://localhost:3000";
}

function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export async function POST(req: Request) {
  try {
    const { amount, currency = "NGN", email, metadata = {} } = await req.json();

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "PAYSTACK_SECRET_KEY not set in environment" },
        { status: 500 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    const cur = String(currency || "NGN").toUpperCase();
    const donorEmail = String(email || "donations@celf.ng");
    const callbackUrl = `${getSiteUrl()}/donate/success`;

    const body = {
      amount: toMinorUnits(Number(amount)),
      currency: cur,
      email: donorEmail,
      callback_url: callbackUrl,
      metadata,
    };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to initialize Paystack", meta: data || null },
        { status: res.status }
      );
    }

    const payload = data?.data || {};
    return NextResponse.json({
      success: true,
      message: "Initialized donation",
      data: {
        authorization_url: payload.authorization_url,
        access_code: payload.access_code,
        reference: payload.reference,
        provider: "paystack",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}