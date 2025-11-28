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

      navigate(`/meeting/${id}?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error("❌ Error creating meeting:", err.response?.data || err.message || err);
      alert("Create meeting failed — check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🤖 AI Meetings
        </h1>

        <div className="flex items-center gap-6 text-gray-700">
          <a href="/" className="hover:text-black transition">Home</a>
          <a href="/join" className="hover:text-black transition">Join Meeting</a>
          <a href="/about" className="hover:text-black transition">About</a>
        </div>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Smart AI-Powered Meetings
        </h2>
        <p className="text-gray-600 max-w-md mb-8">
          Create or join high-quality video meetings with real-time chat, screen share,
          active speaker detection, and AI-enhanced controls.
        </p>

        <button
          onClick={createMeeting}
          className="px-8 py-3 bg-black text-white rounded-lg shadow-md hover:bg-gray-900 transition"
        >
          🚀 Create Meeting
        </button>

        <div className="mt-6">
          <a 
            className="text-sm text-blue-600 hover:underline" 
            href="/join"
          >
            Join an existing meeting →
          </a>
        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} AI Meetings • All Rights Reserved
      </footer>
    </div>
  );
}
