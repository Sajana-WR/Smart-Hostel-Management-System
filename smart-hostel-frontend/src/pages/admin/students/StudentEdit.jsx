// src/pages/admin/students/StudentEdit.jsx
import { useParams, Link } from "react-router-dom";
import { mockStudents } from "../../../data/mockStudents";

export default function StudentEdit() {
  const { id } = useParams();
  const student = mockStudents.find((s) => s.id === id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Edit Student</h2>

          <p className="text-sm text-slate-400">
            ID: {id}{" "}
            {student ? `– ${student.name}` : "(not found in sample data)"}
          </p>
        </div>

        <Link
          to="/admin/students"
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back to list
        </Link>
      </div>

      {/* Form */}
      <form className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" defaultValue={student?.name} />
          <Field label="Student ID" defaultValue={student?.id} />
          <Field label="Email" type="email" defaultValue={student?.email} />
          <Field label="Room Number" defaultValue={student?.room} />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Status</label>

          <select
            defaultValue={student?.status || "Active"}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 
            text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">

          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-600 text-sm 
            text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm 
            font-medium hover:bg-emerald-700 shadow-md"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable Field Component */
function Field({ label, type = "text", defaultValue = "" }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">{label}</label>

      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 
        text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      />
    </div>
  );
}
