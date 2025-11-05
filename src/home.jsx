// 📁 src/pages/HomePage.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const createMeeting = async () => {
    try {
      console.log("🎟️ Getting token...");

      // 1️⃣ Get VideoSDK token from backend
      const tokenRes = await axios.get("https://ai-backend-zczd.onrender.com/api/get-token");
      const token = tokenRes.data?.token;

      if (!token) throw new Error("Token not received!");

      console.log("✅ Token received:", token);

      // 2️⃣ Create meeting using that token
      console.log("🧩 Creating meeting...");
      const meetRes = await axios.post(
        "https://api.videosdk.live/v2/rooms",  // ✅ Direct VideoSDK endpoint
        {},
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const meetingId = meetRes.data.roomId || meetRes.data.meetingId;
      console.log("🎉 Meeting created:", meetingId);

      setMeetingId(meetingId);

      // 3️⃣ Redirect user to meeting page
      navigate(`/meeting/${meetingId}?token=${token}`);
    } catch (err) {
      console.error("❌ Error creating meeting:", err);
      alert("Failed to create meeting. Please check your backend token or network.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🎥 AI Meeting Dashboard</h1>
      <button
        onClick={createMeeting}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        Create Meeting
      </button>
    </div>
  );
}
