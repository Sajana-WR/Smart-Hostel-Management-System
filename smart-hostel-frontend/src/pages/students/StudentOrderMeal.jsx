// src/pages/students/StudentOrderMeal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function StudentOrderMeal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mealType: "BREAKFAST",
    orderDate: "",
    timeSlot: "7.00 AM - 8.00 AM",
    quantity: 1,
    specialNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.orderDate) {
      setError("Please select a date.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/canteen/orders", {
        ...formData,
        quantity: parseInt(formData.quantity),
        studentId: parseInt(userId),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unexpected server error");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-3xl">
        <div className="bg-[#0d1733]/70 border border-green-700 rounded-xl p-10 text-center shadow-lg">
          <p className="text-5xl mb-4">✅</p>
          <h3 className="text-xl font-semibold text-white mb-2">Order Placed Successfully!</h3>
          <p className="text-slate-400 text-sm mb-6">
            Your meal has been reserved. You'll receive a confirmation shortly.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  mealType: "BREAKFAST",
                  orderDate: "",
                  timeSlot: "7.00 AM - 8.00 AM",
                  quantity: 1,
                  specialNotes: "",
                });
              }}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Place Another Order
            </button>
            <button
              onClick={() => navigate("/students/canteen/menu")}
              className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              View Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Order a Meal</h2>
        <p className="text-sm text-slate-400 mt-1">
          Reserve your meal in advance to avoid queues.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-[#0d1733]/70 rounded-xl shadow-lg border border-slate-800 p-6 space-y-6 text-sm">

        {/* Grid Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Meal Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">
              Meal Type
            </label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-[#0b1328] text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">
              Date
            </label>
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-slate-700 bg-[#0b1328] text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">
              Time Slot
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-[#0b1328] text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="7.00 AM - 8.00 AM">7.00 AM - 8.00 AM</option>
              <option value="12.00 PM - 1.30 PM">12.00 PM - 1.30 PM</option>
              <option value="7.00 PM - 8.30 PM">7.00 PM - 8.30 PM</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-[#0b1328] text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 uppercase">
            Special Notes
          </label>
          <textarea
            name="specialNotes"
            rows={3}
            value={formData.specialNotes}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-[#0b1328] text-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Eg. Less spicy, no onions, etc."
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg px-4 py-3 text-xs text-blue-300">
          ℹ️ Your order will be linked to your student ID. You'll receive updates when canteen staff confirms.
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/students/dashboard")}
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}