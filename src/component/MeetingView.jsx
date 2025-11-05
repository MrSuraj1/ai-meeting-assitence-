// 📁 src/components/MeetingView.jsx
import React, { useEffect, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// 🔹 Individual Participant video view
const ParticipantView = ({ participantId }) => {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🎥 useEffect for:", participantId);
    console.log("   webcamOn:", webcamOn, "| webcamStream:", webcamStream);

    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      console.log("✅ Stream attached for:", participantId);
    } else {
      console.log("⚠️ Stream not ready for:", participantId);
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="p-3 text-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg w-64 h-48 border shadow-md"
      />
      <p className="text-sm mt-2 font-medium">{participantId}</p>
    </div>
  );
};

// 🔹 Main Meeting View
export const MeetingView = () => {
  const { join, participants, enableWebcam } = useMeeting();

  useEffect(() => {
    console.log("🚀 Joining meeting...");
    join();

    setTimeout(() => {
      console.log("🎥 Forcing webcam enable...");
      enableWebcam();
    }, 1000);
  }, []);

  useEffect(() => {
    console.log("👥 Participants:", [...participants.keys()]);
  }, [participants]);

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-2xl font-semibold mb-4">🎥 Live Meeting</h1>
      <div className="flex flex-wrap justify-center gap-4">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};
