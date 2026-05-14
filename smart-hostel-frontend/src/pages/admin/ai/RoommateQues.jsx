// src/pages/admin/ai/RoommateQues.jsx
import { useState } from "react";

export default function RoommateQues() {
  const [form, setForm] = useState({
    studyTime: "",
    sleepTime: "",
    cleanliness: "",
    musicPreference: "",
    smoking: "",
    introvertExtrovert: "",
  });

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Roommate Questionnaire Submitted Successfully!");
    console.log(form);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Roommate Matching – Questionnaire</h2>
        <p className="text-gray-500 mt-1">Fill these questions to help the system recommend better roommate matches.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <Question label="Preferred Study Time" value={form.studyTime} onChange={(v) => updateField("studyTime", v)} options={["Early Morning", "Afternoon", "Evening", "Late Night"]} />
        <Question label="Typical Sleep Time" value={form.sleepTime} onChange={(v) => updateField("sleepTime", v)} options={["Before 10 PM", "10 PM – Midnight", "After Midnight"]} />
        <Question label="Cleanliness Preference" value={form.cleanliness} onChange={(v) => updateField("cleanliness", v)} options={["Very Clean", "Moderate", "Messy"]} />
        <Question label="Music & Noise Tolerance" value={form.musicPreference} onChange={(v) => updateField("musicPreference", v)} options={["Quiet", "Medium Noise", "Loud Music OK"]} />
        <Question label="Smoking Preference" value={form.smoking} onChange={(v) => updateField("smoking", v)} options={["Non-Smoker", "Smoker", "Occasional Smoker"]} />
        <Question label="Personality Type" value={form.introvertExtrovert} onChange={(v) => updateField("introvertExtrovert", v)} options={["Introvert", "Extrovert", "Ambivert"]} />

        <button type="submit" className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
          Save Questionnaire
        </button>
      </form>
    </div>
  );
}

function Question({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <p className="text-gray-700 font-medium">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Select an option</option>
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );
}