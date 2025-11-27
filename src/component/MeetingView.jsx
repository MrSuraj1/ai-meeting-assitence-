// src/component/meetingView.jsx
import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// Participant sub-component
function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const ref = useRef(null);

  useEffect(() => {
    console.log("🔄 Participant effect:", participantId, { webcamOn, webcamStream });
    if (webcamOn && webcamStream && ref.current) {
      try {
        const ms = new MediaStream();
        ms.addTrack(webcamStream.track);
        ref.current.srcObject = ms;
        ref.current.play?.();
        console.log("✅ Video attached:", participantId);
      } catch (err) {
        console.error("❌ attach error for", participantId, err);
      }
    } else {
      // clear the element if stream has gone
      if (ref.current && !webcamOn) {
        try {
          if (ref.current.srcObject) {
            ref.current.srcObject.getTracks().forEach(t => t.stop());
          }
        } catch (e) {}
        ref.current.srcObject = null;
      }
      console.log("⚠️ Webcam not ready:", participantId);
    }
  }, [webcamStream, webcamOn, participantId]);

  return (
    <div className="p-3 text-center">
      <video ref={ref} autoPlay playsInline muted className="w-64 h-48 rounded-lg border bg-black" />
      <p className="mt-2 text-sm">{participantId}</p>
    </div>
  );
}

// Main MeetingView
export const MeetingView = () => {
  const { join, participants, enableWebcam, leave } = useMeeting();
  const [joined, setJoined] = useState(false);
  const [camError, setCamError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        console.log("🚀 calling join()");
        await join(); // join returns a promise
        setJoined(true);
        console.log("✅ join() success");
      } catch (err) {
        console.error("❌ join() failed", err);
      }
    })();

    return () => {
      // leave on unmount to clean
      try { leave && leave(); } catch (e) {}
    };
  }, [join, leave]);

  const startWebcam = async () => {
    setCamError(null);
    try {
      console.log("🎥 Trying to enable webcam...");
      await enableWebcam(); // this may ask permission
      console.log("✅ Webcam enabled");
    } catch (err) {
      console.error("❌ enableWebcam failed:", err);
      setCamError(err);
      // optional fallback check
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach(t => t.stop());
        console.log("✅ getUserMedia fallback succeeded");
      } catch (gmErr) {
        console.warn("❌ getUserMedia fallback failed:", gmErr);
      }
    }
  };

  useEffect(() => {
    console.log("👥 Participants now =", [...participants.keys()]);
  }, [participants]);

  return (
    <div className="text-center mt-6">
      <h1 className="text-2xl font-bold mb-4">🎥 Live Meeting</h1>

      <div className="mb-4">
        <button
          onClick={startWebcam}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow mr-3"
        >
          Enable Webcam
        </button>

        <button onClick={() => console.log("participants:", [...participants.keys()])}
          className="px-4 py-2 bg-gray-200 rounded">
          Debug Participants
        </button>
      </div>

      {camError && <div className="text-red-600 mb-3">Camera error: {String(camError && camError.message)}</div>}

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {[...participants.keys()].map((id) => (
          <ParticipantView key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};
