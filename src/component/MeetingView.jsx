import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// 🔹 Participant view with extra logs
const ParticipantView = ({ participantId }) => {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log(`[ParticipantView] useEffect for: ${participantId}`);
    console.log(`[ParticipantView] webcamOn:`, webcamOn, "| webcamStream:", webcamStream);

    try {
      if (webcamOn && webcamStream && videoRef.current) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        videoRef.current.srcObject = mediaStream;
        console.log(`[ParticipantView] ✅ Stream attached for: ${participantId}`);
      } else {
        console.log(`[ParticipantView] ⚠ Stream not ready for: ${participantId}`);
      }
    } catch (err) {
      console.error(`[ParticipantView] ❌ Error attaching stream for ${participantId}:`, err);
    }
  }, [webcamStream, webcamOn, participantId]);

  return (
    <div className="p-3 text-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg w-64 h-48 border shadow-md bg-black"
      />
      <p className="text-sm mt-2 font-medium">{participantId}</p>
    </div>
  );
};

// 🔹 Main Meeting View with robust enableWebcam handler
export const MeetingView = () => {
  const { join, participants, enableWebcam, isWebcamOn } = useMeeting();
  const [joined, setJoined] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    console.log("[MeetingView] 🚀 auto-join starting...");
    try {
      join();
      setJoined(true);
      console.log("[MeetingView] ✅ join() called");
    } catch (err) {
      console.error("[MeetingView] ❌ join() error:", err);
    }
  }, [join]);

  const handleStartCamera = async () => {
    console.log("🎥 User clicked → enabling webcam...");
    setCameraError(null);

    try {
      // Try SDK's enableWebcam (may return a Promise)
      const r = await enableWebcam();
      console.log("🎯 enableWebcam returned:", r);
      // Small check with navigator.getUserMedia to see browser-level permission
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("⚠ navigator.mediaDevices.getUserMedia not supported");
      } else {
        try {
          // quick check — requestMedia only to see if browser allows it
          const streamCheck = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log("🎬 Browser getUserMedia succeeded (check):", streamCheck);
          // stop the check tracks to not use camera twice
          streamCheck.getTracks().forEach(t => t.stop());
        } catch (gmErr) {
          console.warn("❌ Browser getUserMedia failed:", gmErr);
          setCameraError(gmErr);
        }
      }
    } catch (err) {
      console.error("❌ enableWebcam threw:", err);
      setCameraError(err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-2xl font-semibold mb-4">🎥 Live Meeting</h1>

      {joined && (
        <div className="mb-4">
          <button
            onClick={handleStartCamera}
            className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-md mr-3"
          >
            Start Camera
          </button>

          <button
            onClick={() => {
              console.log("[MeetingView] participants keys:", [...participants.keys()]);
              alert("See console for participants list");
            }}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Debug Participants
          </button>
        </div>
      )}

      {cameraError && (
        <div className="text-red-600 mb-3">
          Camera error: {cameraError.message || String(cameraError)}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};
