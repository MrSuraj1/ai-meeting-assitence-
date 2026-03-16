import React, { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";
import { 
  Rocket, Video, Shield, Sparkles, ArrowRight, Zap, 
  CheckCircle2, Globe, Users, MessageSquare, Monitor
} from "lucide-react";

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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-slate-900 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">AI Meetings</span>
          </h1>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Solutions</a>
            <a href="#" className="hover:text-black transition-colors">Pricing</a>
            <button onClick={() => navigate('/join')} className="px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-black transition-all shadow-md active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-1 text-left animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
              <Zap size={14} className="fill-indigo-600" /> V2.0 IS LIVE
            </div>
            
            <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight">
              Meetings, but <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 animate-gradient-x">Smarter.</span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
              Ditch the notebooks. Our AI generates real-time transcripts, identifies action items, and summarizes meetings while you focus on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={createMeeting}
                disabled={isCreating}
                className="group px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-200 hover:bg-black hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
              >
                {isCreating ? "Waking up AI..." : "Start Free Meeting"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/join')}
                className="px-8 py-4 bg-white text-slate-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center"
              >
                Join with Code
              </button>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <p>Joined by 10k+ teams worldwide</p>
            </div>
          </div>

          {/* Right Dashboard Image Section */}
          <div className="flex-1 relative w-full max-w-[600px] animate-in fade-in zoom-in slide-in-from-right duration-1000 delay-200">
            {/* Main Dashboard Mockup */}
            <div className="relative z-10 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-sm p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800" 
                alt="Dashboard Preview" 
                className="rounded-2xl border border-gray-100 shadow-sm"
              />
              {/* Floating AI Panel Overlay */}
              <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-indigo-100 animate-bounce-slow max-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-bold text-gray-400">AI LIVE</span>
                </div>
                <p className="text-[12px] font-medium text-slate-800">"Summarizing key points regarding the Q3 roadmap..."</p>
              </div>
            </div>
            {/* Background decorative square */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>

        {/* HOW TO JOIN SECTION */}
        <div className="mt-32 py-20 border-y border-gray-100">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Join in 3 Simple Steps</h3>
            <p className="text-gray-500">No complex setups. Just click and collaborate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard number="01" title="Create a Room" desc="Click the 'Start Meeting' button to instantly generate a secure private room." />
            <StepCard number="02" title="Share Link" desc="Copy the room URL or meeting ID and send it to your teammates or clients." />
            <StepCard number="03" title="Start Talking" desc="Let our AI handle the transcription while you have a seamless HD conversation." />
          </div>
        </div>

        {/* FEATURES BENTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<Video className="text-blue-500" />}
            title="HD Video Quality"
            desc="Crystal clear streaming with adaptive bitrate for low bandwidth users."
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

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <h4 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Sparkles className="text-indigo-400 w-5 h-5" /> AI Meetings
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering teams to hold more productive meetings through the power of generative AI and high-fidelity video technology.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6">Product</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Video SDK</a></li>
                <li><a href="#" className="hover:text-white transition">AI Summaries</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6">Company</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6">Contact</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li>support@aimeet.io</li>
                <li>Twitter / X</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} AI Meetings. All rights reserved. Built with ❤️ for the remote world.
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500 group">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 group-hover:rotate-6 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="text-left group">
      <div className="text-4xl font-black text-slate-100 group-hover:text-indigo-100 transition-colors mb-4">{number}</div>
      <h4 className="text-xl font-bold mb-2 text-slate-800">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}