// src/home.jsx
import React from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const createMeeting = async () => {
    try {
      console.log("🎟️ Getting token...");
      const { data: tokenRes } = await API.get("/get-token");
      const token = tokenRes?.token;
      if (!token) throw new Error("No token returned from backend");
      console.log("✅ Token received:", token.substring(0, 40) + "...");

      console.log("🧩 Creating meeting...");
      const { data: meetRes } = await API.post("/create-meeting", { token });
      const id = meetRes.roomId || meetRes.meetingId || meetRes.id;
      if (!id) throw new Error("No meeting id in response: " + JSON.stringify(meetRes));
      console.log("🎉 Meeting created:", id);

      // encode token for URL safety
      navigate(`/meeting/${id}?token=${encodeURIComponent(token)}`);
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

      <div className="mt-6">
        <a className="text-sm text-blue-600" href="/join">Join an existing meeting</a>
      </div>
    </div>
  );
}
