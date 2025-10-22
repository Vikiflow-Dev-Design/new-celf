"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
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

function DonateSuccessPageContent() {
  const searchParams = useSearchParams();
  const reference = useMemo(() => searchParams.get("reference") || "", [searchParams]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("Missing transaction reference in the URL.");
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use website's own API route for verification (works locally and on deploy)
        const res = await fetch(`/api/donations/verify/${encodeURIComponent(reference)}`);
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
          <h1 className="text-3xl font-bold mb-4">Donation {statusText}</h1>
          {loading && <p>Verifying your payment...</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && result && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded">
              <p className="mb-2">Reference: {result.data?.reference}</p>
              <p className="mb-2">Status: {result.data?.status}</p>
              <p className="mb-2">Amount: {result.data?.amount} {result.data?.currency}</p>
              {result.data?.email && <p className="mb-2">Donor Email: {result.data?.email}</p>}
              <p>Thank you for supporting CELF!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DonateSuccessPageContent />
    </Suspense>
  );
}