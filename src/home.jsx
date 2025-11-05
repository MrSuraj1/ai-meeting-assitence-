import { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🎥 AI Meeting Dashboard</h1>
      <button
        onClick={createMeeting}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Create Meeting
      </button>
    </div>
  );
}
