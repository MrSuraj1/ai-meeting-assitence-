// src/ParticipantView.jsx
import React, { useEffect, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

export default function ParticipantView({ participantId }) {
  const {
    webcamStream,
    micStream,
    isLocal,
    webcamOn,
  } = useParticipant(participantId);

  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;

      videoRef.current
        .play()
        .catch((err) => console.log("Video Error:", err));
    }
  }, [webcamStream, webcamOn]);

  return (
    <div style={{ border: "1px solid #444", padding: 10, borderRadius: 10 }}>
      <h4>
        {isLocal ? "You" : "Participant"} — {participantId}
      </h4>

      {webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "300px",
            height: "220px",
            background: "#000",
            borderRadius: 10,
          }}
        />
      ) : (
        <p>Camera Off</p>
      )}
    </div>
  );
}
