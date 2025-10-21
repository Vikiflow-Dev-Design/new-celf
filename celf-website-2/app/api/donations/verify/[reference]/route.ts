import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { reference: string } }) {
  try {
    const reference = params?.reference;
    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Missing reference" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "PAYSTACK_SECRET_KEY not set in environment" },
        { status: 500 }
      );
    }

    const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to verify transaction", meta: data || null },
        { status: res.status }
      );
    }

    const payload = data?.data || {};
    const amountMinor = typeof payload.amount === "number" ? payload.amount : 0;
    const amountMajor = Math.round(amountMinor) / 100;
    const currency = String(payload.currency || "NGN").toUpperCase();
    const email = payload?.customer?.email || undefined;
    const status = payload?.status || "unknown";

    return NextResponse.json({
      success: true,
      message: "Donation verification completed",
      data: {
        reference,
        status,
        amount: amountMajor,
        currency,
        email,
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