import React, { useEffect, useState } from "react";
import {
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";

// ----------------------------
// Each Participant Tile UI
// ----------------------------
function ParticipantTile({ participantId }) {
  const {
    webcamStream,
    micStream,
    micOn,
    webcamOn,
    isLocal,
    displayName,
  } = useParticipant(participantId);

  const videoRef = React.useRef(null);
  const audioRef = React.useRef(null);

  // VIDEO
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [webcamStream]);

  // AUDIO FIX 🔥
  useEffect(() => {
    if (micStream && audioRef.current) {
      const media = new MediaStream();
      media.addTrack(micStream.track);
      audioRef.current.srcObject = media;
      audioRef.current.play().catch(err => console.log(err));
    }
  }, [micStream]);

  return (
    <div className="border rounded-lg p-2 bg-gray-900 text-white relative">

      {/* VIDEO UI */}
      {webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-44 rounded-lg"
        />
      ) : (
        <div className="w-full h-44 bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-xl">{displayName.charAt(0)}</span>
        </div>
      )}

      {/* AUDIO (HIDDEN) */}
      <audio ref={audioRef} autoPlay playsInline />

      <div className="absolute bottom-1 left-2 bg-black/60 text-xs px-2 rounded">
        {displayName} {isLocal && "(You)"}
      </div>

      {!micOn && (
        <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 text-xs rounded">
          Mic Off
        </div>
      )}
    </div>
  );
}

// ----------------------------
// Main Meeting View UI
// ----------------------------
export default function MeetingView() {
  const {
    participants,
    join,
    toggleMic,
    toggleWebcam,
    toggleScreenShare,
    leave,
    localParticipant,
  } = useMeeting();

  const [joined, setJoined] = useState(false);

  return (
    <div className="p-4">
      {!joined ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <button
            onClick={() => {
              join();
              setJoined(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl"
          >
            🚀 Join Meeting
          </button>
        </div>
      ) : (
        <>
          {/* Top Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={toggleMic}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              🎤 Toggle Mic
            </button>

            <button
              onClick={toggleWebcam}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              📷 Toggle Camera
            </button>

            <button
              onClick={toggleScreenShare}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              🖥 Share Screen
            </button>

            <button
              onClick={leave}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              ❌ Leave
            </button>
          </div>

          {/* Participants Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...participants.keys()].map((participantId) => (
              <ParticipantTile
                key={participantId}
                participantId={participantId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
