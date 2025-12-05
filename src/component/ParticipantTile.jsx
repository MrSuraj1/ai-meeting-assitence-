import React from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

export default function ParticipantTile({ participantId, captions, localId }) {
  const { displayName, webcamStream, micStream } = useParticipant(participantId);

  const isLocal = participantId === localId;

  return (
    <div className="relative bg-gray-800 border shadow-lg rounded-xl p-3">

      {/* NAME */}
      <div className="text-sm font-semibold mb-2">
        {displayName} {isLocal && "(You)"}
      </div>

      {/* VIDEO BOX */}
      <div className="h-40 bg-black rounded-lg mb-2 flex items-center justify-center text-gray-300">
        {webcamStream ? "📹 Video On" : "⛔ Webcam Off"}
      </div>

      {/* REMOTE CAPTIONS ONLY */}
      {!isLocal && captions[participantId] && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 p-2 rounded text-sm">
          <strong>Caption:</strong> {captions[participantId]}
        </div>
      )}

      {/* DEBUG */}
      <div className="text-xs text-gray-400 mt-2">
        mic: {micStream ? "on" : "off"}
      </div>
    </div>
  );
}
