import React, { useEffect, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

const ParticipantView = ({ participantId }) => {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🔄 Participant effect:", participantId);

    if (webcamOn && webcamStream && videoRef.current) {
      const stream = new MediaStream();
      stream.addTrack(webcamStream.track);
      videoRef.current.srcObject = stream;
      console.log("✅ Video attached:", participantId);
    } else {
      console.log("⚠️ Webcam not ready:", participantId);
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="p-3 text-center">
      <video ref={videoRef} autoPlay playsInline muted className="w-64 h-48 rounded-lg border" />
      <p>{participantId}</p>
    </div>
  );
};

export const MeetingView = () => {
  const { join, participants, enableWebcam } = useMeeting();

  useEffect(() => {
    console.log("🚀 Joining meeting...");
    join();
  }, []);

  const startWebcam = async () => {
    console.log("🎥 User clicked → enabling webcam...");
    try {
      await enableWebcam();
      console.log("✅ Webcam enabled.");
    } catch (e) {
      console.error("❌ Webcam error:", e);
    }
  };

  return (
    <div className="text-center mt-6">
      <h1 className="text-2xl font-bold mb-4">🎥 Live Meeting</h1>

      <button
        onClick={startWebcam}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow"
      >
        Enable Webcam
      </button>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};
