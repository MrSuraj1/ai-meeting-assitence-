import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// ---------------- PARTICIPANT VIEW ----------------
function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const ref = useRef(null);

  useEffect(() => {
    console.log("🎥 Render:", participantId, { webcamOn, webcamStream });

    if (webcamOn && webcamStream && ref.current) {
      try {
        const ms = new MediaStream();
        ms.addTrack(webcamStream.track);
        ref.current.srcObject = ms;
      } catch (err) {
        console.error("❌ Error setting stream:", err);
      }
    }
  }, [webcamOn, webcamStream]);

  return (
    <div className="p-3 text-center border rounded">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className="w-64 h-48 bg-black rounded"
      />
      <div className="mt-2 text-sm">{participantId}</div>
    </div>
  );
}

// ---------------- MAIN MEETING VIEW ----------------
export function MeetingView() {
  const { join, participants, enableWebcam } = useMeeting();
  const [joined, setJoined] = useState(false);

  // Join only ONCE
  useEffect(() => {
    console.log("🚀 Joining meeting...");
    join();
  }, []);

  // When meeting joined => enable webcam
  useEffect(() => {
    if (!joined) {
      const handler = () => {
        console.log("🎉 meeting-joined event received");
        setJoined(true);
      };

      window.videoSDKEvents?.on("meeting-joined", handler);
      return () => window.videoSDKEvents?.off("meeting-joined", handler);
    }
  }, [joined]);

  // Enable webcam after joined
  useEffect(() => {
    if (joined) {
      console.log("🎥 Enabling webcam AFTER join...");
      enableWebcam().catch((e) => console.error("Webcam failed:", e));
    }
  }, [joined]);

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => enableWebcam()}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
        >
          Start Camera
        </button>

        <button
          onClick={() => console.log("participants:", [...participants.keys()])}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Debug
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
}
