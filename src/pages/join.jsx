import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function JoinPage() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const joinMeeting = async () => {
    try {
      const { data: tokenRes } = await API.get("/get-token");
      navigate(`/meeting/${meetingId}?token=${tokenRes.token}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl mb-3">Join Existing Meeting</h2>
      <input
        placeholder="Enter Meeting ID"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
        className="border p-2 mb-3"
      />
      <button
        onClick={joinMeeting}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Join
      </button>
    </div>
  );
}
