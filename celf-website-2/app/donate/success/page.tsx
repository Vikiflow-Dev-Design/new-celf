"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  success: boolean;
  message?: string;
  data?: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    email?: string;
    provider?: string;
    authorization_url?: string;
    access_code?: string;
  };
};

export default function DonateSuccessPage() {
  const searchParams = useSearchParams();
  const reference = useMemo(() => searchParams.get("reference") || "", [searchParams]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL is not configured. Set NEXT_PUBLIC_BACKEND_URL.");
      return;
    }
    if (!reference) {
      setError("Missing transaction reference in the URL.");
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${backendUrl}/api/donations/verify/${encodeURIComponent(reference)}`);
        const json = (await res.json()) as VerifyResponse;
        if (!res.ok || !json.success) {
          setError(json.message || "Verification failed.");
        }
        setResult(json);
      } catch (e: any) {
        setError(e?.message || "Network error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [reference]);

  const statusText = result?.data?.status || (result?.success ? "success" : "failed");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Thank you for your donation!</h1>

          {!reference && (
            <p className="mt-4 text-center text-red-600">No reference provided. Please check your payment link.</p>
          )}

          {loading && (
            <p className="mt-4 text-center text-gray-700">Verifying your payment…</p>
          )}

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">Verification Error</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && result && (
            <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Reference</p>
              <p className="text-gray-900 font-mono break-all">{result.data?.reference || reference}</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-semibold ${statusText === "success" ? "text-green-600" : statusText === "failed" ? "text-red-600" : "text-gray-900"}`}>{statusText}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {typeof result.data?.amount === "number"
                      ? new Intl.NumberFormat(
                          (result.data?.currency || "NGN") === "NGN" ? "en-NG" : "en-US",
                          { style: "currency", currency: result.data?.currency || "NGN" }
                        ).format(result.data.amount)
                      : "-"}
                  </p>
                </div>
                {result.data?.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{result.data.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-semibold text-gray-900">{result.data?.provider || "paystack"}</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-600">
                If a receipt email does not arrive within a few minutes, please contact our support team.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <a href="/donate" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700">Donate Again</a>
                <a href="/" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-50">Back to Home</a>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}