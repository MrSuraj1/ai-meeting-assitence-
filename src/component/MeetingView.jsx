import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// ------------------- PARTICIPANT VIEW -------------------
const ParticipantView = ({ participantId }) => {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      console.log(`🎥 Video attached for: ${participantId}`);
    }
  }, [webcamOn, webcamStream]);

  return (
    <div className="p-3 text-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg w-64 h-48 border shadow-md bg-black"
      />
      <p className="mt-2 font-medium text-sm">{participantId}</p>
    </div>
  );
};

// ------------------- MAIN MEETING VIEW -------------------
export const MeetingView = () => {
  const { join, participants, enableWebcam, isWebcamOn } = useMeeting();
  const [joined, setJoined] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Join meeting once
  useEffect(() => {
    console.log("🚀 Joining meeting...");
    join();
    setJoined(true);
  }, []);

  // Handle camera ON request
  const handleStartCamera = async () => {
    console.log("🎥 Trying to enable webcam...");

    try {
      await enableWebcam();
      console.log("✅ Webcam enabled");
    } catch (err) {
      console.error("❌ enableWebcam error:", err);
      setCameraError(err.message);
    }
  };

  // Log participants cleanly
  useEffect(() => {
    console.log("👥 Participants now =", [...participants.keys()]);
  }, [participants]);

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-2xl font-semibold mb-4">🎥 Live Meeting</h1>

      {joined && (
        <button
          onClick={handleStartCamera}
          className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-md mb-4"
        >
          {isWebcamOn ? "Camera On" : "Start Camera"}
        </button>
      )}

      {cameraError && (
        <p className="text-red-500 mb-3">Camera Error: {cameraError}</p>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};
