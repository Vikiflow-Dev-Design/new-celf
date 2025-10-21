"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Shield, CheckCircle2, HeartHandshake, Globe, Sparkles, BarChart3 } from "lucide-react";

type Currency = "NGN" | "USD";
type GiftType = "one_time" | "monthly";
type Provider = "paystack" | "paypal";

export default function DonatePage() {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [amount, setAmount] = useState<number>(5000); // default in NGN
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [giftType, setGiftType] = useState<GiftType>("one_time");
  const [provider, setProvider] = useState<Provider>("paystack");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [inHonor, setInHonor] = useState(false);
  const [onBehalf, setOnBehalf] = useState(false);

  const presets = useMemo(() => {
    return currency === "NGN" ? [1000, 2500, 5000, 10000, 25000] : [10, 25, 50, 100, 250];
  }, [currency]);

  const display = useMemo(() => {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", { style: "currency", currency }).format(amount);
  }, [amount, currency]);

  async function startPaystack() {
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email for your receipt.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Please select or enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/donations/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          email,
          metadata: {
            giftType,
            firstName,
            lastName,
            phone,
            city,
            state: stateProvince,
            zip,
            country,
            inHonor,
            onBehalf,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to initialize payment");
      }
      window.location.href = data?.data?.authorization_url || data.authorization_url;
    } catch (e: any) {
      setError(e?.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero full banner only (no text) */}
        <section className="relative h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden border-b border-[#9EFF00]/20">
          <Image
            src="https://images.unsplash.com/photo-1509099836639-18ba1795214b?q=80&w=1920&auto=format&fit=crop"
            alt="Donation banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </section>

        {/* Gift type toggle, amount, donor info, payment */}
        <section className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6 bg-[#0A0A0A] border-[#9EFF00]/30">
                <div className="flex gap-2">
                  <Button variant={giftType === "one_time" ? "primary" : "outline"} onClick={() => setGiftType("one_time")}>One-Time Gift</Button>
                  <Button variant={giftType === "monthly" ? "primary" : "outline"} onClick={() => setGiftType("monthly")} className={giftType === "monthly" ? "border-[#9EFF00] bg-[#111] text-white" : ""}>Monthly Gift</Button>
                </div>
                <p className="mt-2 text-xs text-gray-400">{giftType === "monthly" ? "Recurring monthly billing (coming soon)." : "Single donation."}</p>
              </Card>

              <Card className="p-6 bg-[#0A0A0A] border-[#9EFF00]/30">
                <h2 className="text-lg font-semibold text-white">Select Your Donation Amount</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <Button
                      key={`${currency}-${p}`}
                      variant={amount === p ? "primary" : "outline"}
                      onClick={() => setAmount(p)}
                      className={amount === p ? "border-[#9EFF00] bg-[#9EFF00] text-black" : ""}
                    >
                      {currency === "NGN" ? `₦${p.toLocaleString()}` : `$${p}`}
                    </Button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-gray-300 mb-1">Or, enter your own donation amount</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={currency}
                      onChange={(e) => {
                        const c = e.target.value as Currency;
                        setCurrency(c);
                        setAmount(c === "NGN" ? 5000 : 50);
                      }}
                      className="rounded px-2 py-2 text-sm bg-[#111] border border-[#333] text-white"
                    >
                      <option value="NGN">NGN (₦)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                    <input
                      type="number"
                      min={currency === "NGN" ? 100 : 1}
                      step={currency === "NGN" ? 100 : 1}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="rounded px-3 py-2 w-40 bg-[#111] border border-[#333] text-white"
                    />
                    <span className="text-sm text-gray-400">{display}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-300">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="accent-[#9EFF00]" checked={inHonor} onChange={(e) => setInHonor(e.target.checked)} />
                    Make this gift in honor or in memory of someone.
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="accent-[#9EFF00]" checked={onBehalf} onChange={(e) => setOnBehalf(e.target.checked)} />
                    Make this gift on behalf of an organization.
                  </label>
                </div>
              </Card>

              <Card className="p-6 bg-[#0A0A0A] border-[#9EFF00]/30">
                <h2 className="text-lg font-semibold text-white">Your Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">First Name</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">City</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">State/Province</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ZIP</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={zip} onChange={(e) => setZip(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Country</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Phone</label>
                    <input className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email for receipt</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="rounded px-3 py-2 w-full bg-[#111] border border-[#333] text-white" />
                  </div>
                </div>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </Card>

              <Card className="p-6 bg-[#0A0A0A] border-[#9EFF00]/30">
                <h2 className="text-lg font-semibold text-white">Payment Information</h2>
                <div className="flex gap-2 mt-3">
                  <Button variant={provider === "paystack" ? "primary" : "outline"} onClick={() => setProvider("paystack")} className={provider === "paystack" ? "border-[#9EFF00] bg-[#9EFF00] text-black" : ""}>Paystack</Button>
                  <Button variant={provider === "paypal" ? "primary" : "outline"} onClick={() => setProvider("paypal")} className={provider === "paypal" ? "border-[#9EFF00] bg-[#111] text-white" : ""}>PayPal</Button>
                </div>
                <p className="mt-2 text-xs text-gray-400">{provider === "paypal" ? "PayPal Checkout will open." : "Paystack processes secure card payments."}</p>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => (provider === "paystack" ? startPaystack() : (window.location.href = "/support?provider=paypal"))} disabled={loading} variant="primary" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md">
                  {loading ? "Processing…" : `Donate ${display}`}
                </Button>
              </div>
            </div>

            <aside className="space-y-6">
              <Card className="p-6 bg-[#0A0A0A] border-[#9EFF00]/30">
                <h3 className="font-semibold text-white">Other ways to give</h3>
                <ul className="mt-3 text-sm text-gray-300 list-disc pl-5 space-y-1">
                  <li>Corporate matching</li>
                  <li>Monthly giving</li>
                  <li>Crypto donations</li>
                </ul>
              </Card>
              <Card className="p-6 bg-[#0A0A0A] border-[#9EFF00]/30">
                <h3 className="font-semibold text-white">Your impact</h3>
                <p className="mt-2 text-sm text-gray-300">Funds support mentorship, scholarships, and community programs.</p>
              </Card>
            </aside>
          </div>
        </section>

        {/* Why donate */}
        <section className="bg-[#0A0A0A] border-t border-[#1A1A1A]">
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-white">Why Your Donation Matters</h2>
            <p className="text-gray-300 mt-2 max-w-2xl">Every contribution helps expand access to education, connect mentors with learners, and strengthen communities.</p>
            <div className="grid gap-6 mt-8 md:grid-cols-3">
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <HeartHandshake className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Mentorship at Scale</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">Help train mentors and match them with students globally, guiding career growth and confidence.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Scholarship Access</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">Support learners who need financial assistance to continue their education and pursue opportunities.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Community Empowerment</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">Strengthen programs that build skills, resilience, and new pathways in local communities.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-[#0B0B0B] border-t border-[#1A1A1A]">
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-white">Benefits of Donating</h2>
            <div className="grid gap-6 mt-6 md:grid-cols-2">
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Transparent Impact Updates</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">We share progress on mentorship matches, scholarship disbursements, and community initiatives.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Dedicated Donor Support</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">Our team assists with questions, acknowledgments, and connecting your gift to specific programs.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Secure Payments</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">Payments are processed via Paystack or PayPal with industry-standard security.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#9EFF00]" />
                  <h3 className="font-semibold text-white">Recognition (Optional)</h3>
                </div>
                <p className="text-sm text-gray-300 mt-3">Opt-in to be recognized on our site or events for your support.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust & Security */}
        <section className="bg-[#0A0A0A] border-t border-[#1A1A1A]">
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Trust & Security</h2>
                <p className="text-gray-300 mt-2 max-w-2xl">We use secure payment processors and follow best practices to protect your information.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Powered by</span>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded bg-[#111] border border-[#1F1F1F] text-gray-200">Paystack</div>
                  <div className="px-3 py-1 rounded bg-[#111] border border-[#1F1F1F] text-gray-200">PayPal</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#0B0B0B] border-t border-[#1A1A1A]">
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="grid gap-6 mt-6 md:grid-cols-2">
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <h3 className="font-semibold text-white">Can I donate in NGN or USD?</h3>
                <p className="text-sm text-gray-300 mt-2">Yes, choose your preferred currency on this page and continue with Paystack.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <h3 className="font-semibold text-white">Will I receive an acknowledgment?</h3>
                <p className="text-sm text-gray-300 mt-2">You'll receive an on-screen confirmation and email acknowledgment after successful payment.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <h3 className="font-semibold text-white">Is my payment secure?</h3>
                <p className="text-sm text-gray-300 mt-2">Payments are processed via trusted providers with secure encryption.</p>
              </Card>
              <Card className="p-6 bg-[#111] border-[#1F1F1F]">
                <h3 className="font-semibold text-white">Can my company partner with CELF?</h3>
                <p className="text-sm text-gray-300 mt-2">Yes, contact our team to explore sponsorships, matching programs, or strategic partnerships.</p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}