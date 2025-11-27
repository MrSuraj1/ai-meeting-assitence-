// src/MeetingView.jsx
import React, { useEffect } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import ParticipantView from "./videoView";

export default function MeetingView({ meetingId, token }) {
  console.log("🎬 MeetingView mounted", { meetingId, token });

  const {
    join,
    participants,
    toggleMic,
    toggleWebcam,
  } = useMeeting();

  useEffect(() => {
    console.log("📞 Joining meeting...");
    join();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Meeting ID: {meetingId}</h2>

      <button onClick={toggleMic}>🎤 Toggle Mic</button>
      <button onClick={toggleWebcam}>📷 Toggle Webcam</button>

      <h3 style={{ marginTop: 20 }}>Participants</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {[...participants.keys()].map((participantId) => (
          <ParticipantView key={participantId} participantId={participantId} />
        ))}
      </div>
    </div>
  );
}
