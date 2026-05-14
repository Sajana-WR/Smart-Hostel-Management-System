import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8080";

export default function MyProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); // /api/students/me
  const [surveyData, setSurveyData] = useState(null); // /api/survey/me -> data
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);
  const email = useMemo(() => localStorage.getItem("email"), []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMsg("");

      if (!token && !email) {
        setLoading(false);
        setErrorMsg("Not logged in. Please login again.");
        return;
      }

      const config = {
        signal: controller.signal,
        headers: {},
        params: {},
      };

      if (token) config.headers.Authorization = `Bearer ${token}`;
      else config.params.email = email;

      try {
        // 1) Load profile
        const profileRes = await axios.get(`${API_BASE}/api/students/me`, config);
        setProfile(profileRes.data);

        // 2) Load questionnaire answers
        // response shape: { userId, surveyCompleted, data: {...} }
        const surveyRes = await axios.get(`${API_BASE}/api/survey/me`, config);
        setSurveyData(surveyRes?.data?.data || {});
      } catch (err) {
        if (axios.isCancel(err)) return;

        const status = err?.response?.status;
        const serverMsg =
          err?.response?.data?.message ||
          (typeof err?.response?.data === "string" ? err.response.data : "");

        if (status === 401 || status === 403) {
          setErrorMsg("Unauthorized. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 600);
        } else if (status === 404) {
          setErrorMsg("Profile not found.");
        } else {
          setErrorMsg(serverMsg || "Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [navigate, token, email]);

  if (loading) {
    return (
      <div className="text-slate-300 text-center mt-10">Loading profile...</div>
    );
  }

  if (!profile) {
    return (
      <div className="text-red-400 text-center mt-10">
        {errorMsg || "Failed to load profile."}
      </div>
    );
  }

  // surveyCompleted can come from profile or from survey API
  const hasSurvey =
    profile.surveyCompleted === true ||
    (surveyData && Object.keys(surveyData).length > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-100">My Profile</h2>

      {/* PROFILE CARD */}
      <div className="bg-[#0f1b3b] border border-slate-800 rounded-xl shadow-lg p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-slate-300 text-sm">
          <ProfileItem label="User ID" value={profile.id} />
          <ProfileItem label="Full Name" value={profile.fullName} />
          <ProfileItem label="Email" value={profile.email} />
          <ProfileItem label="Username" value={profile.username} />

          {/* Removed Student ID + Course */}
          <ProfileItem label="Degree" value={profile.degree} />
          <ProfileItem label="Hometown" value={profile.hometown} />
          <ProfileItem label="School" value={profile.school} />

          <ProfileItem
            label="Survey Completed"
            value={profile.surveyCompleted ? "Yes" : "No"}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/students/profile/edit"
            className="inline-block bg-blue-600 hover:bg-blue-700 transition px-4 py-2.5 rounded-lg font-medium text-white shadow-md"
          >
            Edit Profile
          </Link>

          {!profile.surveyCompleted && (
            <Link
              to="/students/roommate-questionnaire"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2.5 rounded-lg font-medium text-white shadow-md"
            >
              Fill Questionnaire
            </Link>
          )}
        </div>
      </div>

      {/* QUESTIONNAIRE CARD */}
      <div className="bg-[#0f1b3b] border border-slate-800 rounded-xl shadow-lg p-6 max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-100">
            Roommate Questionnaire
          </h3>

          {hasSurvey ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-200 border border-emerald-800">
              Available
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-900/40 text-amber-200 border border-amber-800">
              Not submitted
            </span>
          )}
        </div>

        {!hasSurvey ? (
          <div className="mt-4 text-slate-300 text-sm">
            You haven’t submitted your roommate questionnaire yet.
            <div className="mt-4">
              <Link
                to="/students/roommate-questionnaire"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2.5 rounded-lg font-medium text-white shadow-md"
              >
                Start Questionnaire
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 text-slate-300 text-sm">
            <ProfileItem
              label="Preferred Study Time"
              value={surveyData?.preferredStudyTime}
            />
            <ProfileItem
              label="Typical Sleep Time"
              value={surveyData?.typicalSleepTime}
            />
            <ProfileItem label="Wake Up Time" value={surveyData?.wakeUpTime} />
            <ProfileItem
              label="Cleanliness Preference"
              value={surveyData?.cleanlinessPreference}
            />
            <ProfileItem
              label="Noise Tolerance"
              value={surveyData?.noiseTolerance}
            />
            <ProfileItem
              label="Guest Frequency"
              value={surveyData?.guestFrequency}
            />
            <ProfileItem
              label="Smoking Preference"
              value={surveyData?.smokingPreference}
            />
            <ProfileItem
              label="Personality Type"
              value={surveyData?.personalityType}
            />
            <ProfileItem
              label="Room Temperature"
              value={surveyData?.roomTempPreference}
            />
            <ProfileItem
              label="Sharing Preference"
              value={surveyData?.sharingPreference}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-base font-medium text-slate-100">
        {formatValue(value)}
      </p>
    </div>
  );
}

function formatValue(value) {
  if (value === 0) return "0";
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "string") {
    const t = value.trim();
    return t.length ? t : "Not provided";
  }
  return String(value);
}