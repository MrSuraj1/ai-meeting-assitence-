// src/pages/join.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function JoinPage() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const joinMeeting = async () => {
    try {
      if (!meetingId.trim()) return alert("Enter meeting id");
      const { data: tokenRes } = await API.get("/get-token");
      const token = tokenRes?.token;
      if (!token) throw new Error("Failed to get token");
      navigate(`/meeting/${meetingId.trim()}?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error(err);
      alert("Could not join — see console");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Join Meeting</h2>
          <p className="text-blue-200 mt-2 text-sm">Enter a code to connect with your team</p>
        </div>

        {/* Input Field */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: abc-123-xyz"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={joinMeeting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:transform active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 ease-in-out"
          >
            Join Now
          </button>
        </div>

        {/* Footer Hint */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-xs">
            Make sure your camera is ready before joining.
          </p>
        </div>
      </div>
    </div>
  );
}