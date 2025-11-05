import { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";
import { Video, Plus } from "lucide-react"; // modern icons
import { motion } from "framer-motion"; // smooth animations

export default function HomePage() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const createMeeting = async () => {
    try {
      // 1️⃣ Get VideoSDK token
      const { data: tokenRes } = await API.get("/get-token");
      const token = tokenRes.token;

      // 2️⃣ Create meeting using token
      const { data: meetRes } = await API.post("/create-meeting", { token });
      console.log("✅ Meeting created:", meetRes.roomId || meetRes.meetingId);

      const id = meetRes.roomId || meetRes.meetingId;
      setMeetingId(id);

      // 3️⃣ Navigate to meeting page
      navigate(`/meeting/${id}?token=${token}`);
    } catch (err) {
      console.error("❌ Error creating meeting:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <Video className="w-16 h-16 text-purple-400" />
        </motion.div>

        <h1 className="text-3xl font-extrabold mb-4 tracking-wide">
          AI Meeting Dashboard
        </h1>
        <p className="text-gray-300 mb-8 text-sm">
          Start your secure video meeting instantly with AI-powered collaboration.
        </p>

        <button
          onClick={createMeeting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/40 active:scale-95"
        >
          <Plus size={20} />
          Create New Meeting
        </button>

        {meetingId && (
          <div className="mt-6 text-green-400 text-sm">
            ✅ Meeting Created: <span className="font-mono">{meetingId}</span>
          </div>
        )}
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 text-xs text-gray-400"
      >
        Powered by <span className="text-purple-400 font-semibold">VideoSDK AI</span>
      </motion.footer>
    </div>
  );
}
