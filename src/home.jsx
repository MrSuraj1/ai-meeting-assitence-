import React from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const createMeeting = async () => {
    try {
      console.log("🎟️ Getting token...");
      const { data: tokenRes } = await API.get("/get-token");
      console.log("✅ Token received:", tokenRes.token?.substring(0, 40) + "...");

      console.log("🧩 Creating meeting...");
      const { data: meetRes } = await API.post("/create-meeting", { token: tokenRes.token });
      const id = meetRes.roomId || meetRes.meetingId;
      console.log("🎉 Meeting created:", id);
      navigate(`/meeting/${id}?token=${encodeURIComponent(tokenRes.token)}`);
    } catch (err) {
      console.error("❌ Error creating meeting:", err.response?.data || err.message || err);
      alert("Create meeting failed — check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">🎥 AI Meeting Dashboard</h1>
      <button
        onClick={createMeeting}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Create Meeting
      </button>
    </div>
  );
}
