import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

// ParticipantView
function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const ref = useRef(null);

  useEffect(() => {
    console.log("🎥 useEffect for:", participantId, { webcamOn, webcamStream });
    if (webcamOn && webcamStream && ref.current) {
      try {
        const ms = new MediaStream();
        ms.addTrack(webcamStream.track);
        ref.current.srcObject = ms;
      } catch (err) {
        console.error("Error attaching stream:", err);
      }
    }
  }, [webcamStream, webcamOn, participantId]);

  return (
    <div className="p-3 text-center">
      <video ref={ref} autoPlay playsInline muted className="w-64 h-48 bg-black rounded" />
      <div className="mt-2 text-sm">{participantId}</div>
    </div>
  );
}

// Main MeetingView
export function MeetingView() {
  const { join, participants, enableWebcam, leave } = useMeeting();
  const [joined, setJoined] = useState(false);
  const [camError, setCamError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        console.log("🚀 calling join()");
        await join();
        setJoined(true);
        console.log("✅ join() success");
      } catch (err) {
        console.error("❌ join() failed:", err);
      }
    })();
    // cleanup - leave when unmount
    return () => leave && leave();
  }, [join, leave]);

  const startCamera = async () => {
    setCamError(null);
    try {
      console.log("🎥 enabling webcam via SDK...");
      const r = await enableWebcam();
      console.log("🎯 enableWebcam returned:", r);
    } catch (err) {
      console.error("❌ enableWebcam error:", err);
      setCamError(err);
      // quick browser-level fallback check:
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach(t => t.stop());
        console.log("✅ browser getUserMedia succeeded separately");
      } catch (gmErr) {
        console.warn("❌ browser getUserMedia failed:", gmErr);
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button onClick={startCamera} className="px-4 py-2 bg-blue-600 text-white rounded mr-2">Start Camera</button>
        <button onClick={() => console.log("participants:", [...participants.keys()])} className="px-3 py-1 bg-gray-200 rounded">Debug</button>
        {camError && <div className="text-red-600 mt-2">Camera error: {String(camError.message || camError)}</div>}
      </div>

      <div className="flex flex-wrap gap-4">
        {[...participants.keys()].map(id => <ParticipantView key={id} participantId={id} />)}
      </div>
    </div>
  );
}
