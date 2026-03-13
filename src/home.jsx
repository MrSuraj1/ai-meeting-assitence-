// src/home.jsx
import React, { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";
import { Rocket, Video, Shield, Sparkles, ArrowRight, Zap } from "lucide-react"; // Optional: lucide-react for icons

export default function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const createMeeting = async () => {
    setIsCreating(true);
    try {
      const { data: tokenRes } = await API.get("/get-token");
      const token = tokenRes?.token;
      if (!token) throw new Error("No token returned from backend");

      const { data: meetRes } = await API.post("/create-meeting", { token });
      const id = meetRes.roomId || meetRes.meetingId || meetRes.id;
      if (!id) throw new Error("No meeting id in response");

      navigate(`/meeting/${id}?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Failed to start meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Dynamic Background Blob */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[120px]" />
      </div>

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span>AI Meetings</span>
          </h1>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="/" className="hover:text-black transition-colors">Home</a>
            <a href="/join" className="hover:text-black transition-colors">Join</a>
            <a href="/about" className="hover:text-black transition-colors">Features</a>
            <button 
              onClick={() => navigate('/join')}
              className="px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
            <Zap size={14} /> Now with Real-time Translation
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Meetings, but <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Smarter.</span>
          </h2>
          
          <p className="text-lg text-gray-500 max-w-2xl mb-10 leading-relaxed">
            Experience the next generation of collaboration. Our AI handles the notes, 
            summaries, and real-time captions so you can focus on the conversation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={createMeeting}
              disabled={isCreating}
              className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-100 hover:bg-black hover:-translate-y-1 transition-all duration-200 flex items-center gap-3"
            >
              {isCreating ? "Preparing Room..." : "Start Instant Meeting"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/join')}
              className="px-8 py-4 bg-white text-slate-700 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              Join with Code
            </button>
          </div>
        </div>

        {/* ---------------- BENTO FEATURES ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <FeatureCard 
            icon={<Video className="text-blue-500" />}
            title="HD Video Quality"
            desc="Crystal clear 4K streaming with adaptive bitrate for low bandwidth."
          />
          <FeatureCard 
            icon={<Sparkles className="text-indigo-500" />}
            title="AI Transcription"
            desc="Real-time subtitles and automated meeting summaries in 20+ languages."
          />
          <FeatureCard 
            icon={<Shield className="text-emerald-500" />}
            title="Secure by Design"
            desc="End-to-end encryption for every participant, every time."
          />
        </div>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="mt-auto py-10 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} AI Meetings • Built for the future of work.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-300 group">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}