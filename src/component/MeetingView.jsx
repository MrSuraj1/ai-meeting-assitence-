import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// 🔹 Individual Participant video view
const ParticipantView = ({ participantId }) => {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
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
  const [joined, setJoined] = useState(false);

  // 🟢 Join meeting auto
  useEffect(() => {
    join();
    setJoined(true);
  }, []);

  // 🟢 Enable webcam only after USER CLICK
  const handleStartCamera = () => {
    console.log("🎥 User clicked → enabling webcam...");
    enableWebcam();
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-2xl font-semibold mb-4">🎥 Live Meeting</h1>

      {/* 👇 Button required for HTTPS sites */}
      {joined && (
        <button
          onClick={handleStartCamera}
          className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-md mb-4"
        >
          Start Camera
        </button>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};
