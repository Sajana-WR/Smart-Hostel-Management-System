// src/pages/students/StudentMakePayment.jsx
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../../api/api";

// ⚠️ Replace with your NEW publishable key from Stripe Dashboard
const stripePromise = loadStripe("pk_test_51T5RA7FkMvKTFqt6ogtAQG1uym1tSW6BKTzTdXeAFhZlNb8hEVMIN5BneN6knmX6YCb657LXvL6m4Si8Vm9Vsyix002hI0fF6b");

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function getCurrentMonthYear() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(monthYear) {
  if (!monthYear) return "-";
  const [y, m] = monthYear.split("-");
  const idx = Number(m) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return monthYear;
  return `${MONTHS[idx]} ${y}`;
}

// ── Stripe Card Form (used when method === "CARD") ──────────────────────────
function StripeCardForm({ amount, monthYear, onSuccess, onError }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError("");

    try {
      // Step 1: Get clientSecret from backend
      const intentRes = await api.post("/api/payments/create-payment-intent");
      const { clientSecret, paymentIntentId } = intentRes.data;

      // Step 2: Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        onError(result.error.message);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        // Step 3: Save payment record in our database
        await api.post("/api/payments/create", {
          monthYear,
          amount,
          method: "CARD",
          stripePaymentIntentId: paymentIntentId,
        });
        onSuccess(`Payment of Rs. ${Number(amount).toLocaleString("en-LK")} successful for ${formatMonthLabel(monthYear)}!`);
      }
    } catch (err) {
      onError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stripe Card Element */}
      <div>
        <label className="text-xs font-medium text-slate-300 mb-2 block">
          Card Details
        </label>
        <div className="w-full bg-[#0a1125] text-white border border-slate-700 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-blue-600">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#e2e8f0",
                  "::placeholder": { color: "#64748b" },
                  iconColor: "#e2e8f0",
                },
                invalid: { color: "#f87171" },
              },
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          🔒 Your card details are securely handled by Stripe. We never see your card number.
        </p>
      </div>

      {/* Test card hint */}
      <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg px-3 py-2">
        <p className="text-xs text-blue-300">
          🧪 <strong>Test card:</strong> 4242 4242 4242 4242 — Any future expiry — Any CVV
        </p>
      </div>

      {/* Pay Button */}
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={handlePay}
          disabled={submitting || !stripe}
          className="px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-blue-900/30 shadow-sm transition"
        >
          {submitting ? "Processing..." : `Pay Rs. ${Number(amount).toLocaleString("en-LK")}`}
        </button>
      </div>
    </div>
  );
}

// ── PayHere placeholder ────────────────────────────────────────────────────
function PayHereForm({ amount, monthYear, onSuccess, onError }) {
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    setSubmitting(true);
    onError("");
    try {
      await api.post("/api/payments/create", {
        monthYear,
        amount,
        method: "PAYHERE",
      });
      onSuccess(`Payment of Rs. ${Number(amount).toLocaleString("en-LK")} recorded for ${formatMonthLabel(monthYear)}!`);
    } catch (err) {
      onError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-4 py-3">
        <p className="text-sm text-yellow-300 font-medium">PayHere — Local Gateway</p>
        <p className="text-xs text-slate-400 mt-1">
          You will be redirected to PayHere to complete your payment.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={handlePay}
          disabled={submitting}
          className="px-5 py-2 text-sm rounded-lg bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
        >
          {submitting ? "Processing..." : `Pay Rs. ${Number(amount).toLocaleString("en-LK")}`}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudentMakePayment() {
  const userId   = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "";

  const [roomCode,    setRoomCode]    = useState(null);
  const [amount,      setAmount]      = useState(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError,   setInfoError]   = useState("");

  const [method,     setMethod]     = useState("CARD");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");

  const monthYear = getCurrentMonthYear();

  const loadInfo = async () => {
    if (!userId) {
      setInfoError("User ID not found. Please login again.");
      setInfoLoading(false);
      return;
    }
    setInfoLoading(true);
    setInfoError("");
    try {
      const res = await api.get(`/api/payments/info/${userId}`);
      setRoomCode(res.data.roomCode || null);
      setAmount(res.data.amount ?? null);
      setAlreadyPaid(res.data.alreadyPaidThisMonth ?? false);
    } catch (err) {
      setInfoError(err?.response?.data?.message || "Failed to load payment info.");
    } finally {
      setInfoLoading(false);
    }
  };

  useEffect(() => {
    loadInfo();
    // eslint-disable-next-line
  }, []);

  const handleSuccess = (msg) => {
    setSuccessMsg(msg);
    setAlreadyPaid(true);
    setErrorMsg("");
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* PAGE TITLE */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Make Payment</h2>
        <p className="text-sm text-slate-400 mt-1">
          Pay your monthly hostel fee securely.
        </p>
      </div>

      {/* LOADING */}
      {infoLoading && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6">
          <p className="text-slate-300 text-sm">Loading payment details...</p>
        </div>
      )}

      {/* INFO ERROR */}
      {!infoLoading && infoError && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6 space-y-3">
          <p className="text-red-300 text-sm">{infoError}</p>
          <button
            onClick={loadInfo}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* ALREADY PAID (no new success) */}
      {!infoLoading && !infoError && alreadyPaid && !successMsg && (
        <div className="bg-[#0d1733]/70 border border-green-700/50 rounded-xl p-6">
          <p className="text-green-300 font-medium">
            ✅ You have already paid for {formatMonthLabel(monthYear)}.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Check your payment history for details.
          </p>
        </div>
      )}

      {/* SUCCESS after payment */}
      {!infoLoading && !infoError && alreadyPaid && successMsg && (
        <div className="bg-[#0d1733]/70 border border-green-700/50 rounded-xl p-6">
          <p className="text-green-300 font-medium">✅ {successMsg}</p>
          <p className="text-slate-400 text-sm mt-1">
            Check your payment history for details.
          </p>
        </div>
      )}

      {/* PAYMENT CARD */}
      {!infoLoading && !infoError && !alreadyPaid && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">

          {/* DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <PaymentField label="Student"       value={fullName || `User #${userId}`} />
            <PaymentField label="Current Month" value={formatMonthLabel(monthYear)} />
            <PaymentField label="Room"          value={roomCode || "Not assigned"} />
            <PaymentField
              label="Amount"
              value={
                amount != null
                  ? `Rs. ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
                  : "—"
              }
            />
          </div>

          {/* PAYMENT METHOD */}
          <div className="border-t border-slate-700/60 pt-4">
            <p className="text-sm font-medium text-slate-200 mb-3">Payment Method</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaymentOption
                title="Card Payment"
                subtitle="Powered by Stripe 🔒"
                selected={method === "CARD"}
                onClick={() => { setMethod("CARD"); setErrorMsg(""); }}
              />
              <PaymentOption
                title="PayHere"
                subtitle="Sri Lanka 🇱🇰"
                selected={method === "PAYHERE"}
                onClick={() => { setMethod("PAYHERE"); setErrorMsg(""); }}
              />
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
              <p className="text-red-300 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* STRIPE CARD FORM */}
          {method === "CARD" && amount != null && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                amount={amount}
                monthYear={monthYear}
                onSuccess={handleSuccess}
                onError={setErrorMsg}
              />
            </Elements>
          )}

          {/* PAYHERE FORM */}
          {method === "PAYHERE" && amount != null && (
            <PayHereForm
              amount={amount}
              monthYear={monthYear}
              onSuccess={handleSuccess}
              onError={setErrorMsg}
            />
          )}

        </div>
      )}
    </div>
  );
}

/* ─── Sub Components ───────────────────────────────────────────────────────── */

function PaymentField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase text-slate-400">{label}</p>
      <p className="font-medium text-slate-100 mt-1">{value}</p>
    </div>
  );
}

function PaymentOption({ title, subtitle, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full bg-[#0a1125] border rounded-xl px-4 py-3 text-sm
        flex items-center justify-between text-slate-200 transition
        ${selected ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-700 hover:border-blue-500"}
      `}
    >
      <span className="font-medium">{title}</span>
      <span className="text-xs text-slate-400">{subtitle}</span>
    </button>
  );
}