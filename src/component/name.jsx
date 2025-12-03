// src/component/MeetingUI.jsx  
import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiVideo, FiMonitor, FiSend } from "react-icons/fi";

console.log("📌 MeetingUI component loaded");
function ParticipantTile({ participantId, spotlightMode, activeSpeakerId }) {
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    screenShareStream
  } = useParticipant(participantId);

  const meeting = useMeeting();

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const screenRef = useRef(null);

  const [caption, setCaption] = useState("");

  // Listen to Hindi Translation Messages
  useEffect(() => {
    if (!meeting) return;

    const handler = (msg) => {
      if (msg.type === "caption" && msg.senderId === participantId) {
        setCaption(msg.text);
      }
    };

    meeting.addEventListener("message-received", handler);

    return () => {
      meeting.removeEventListener("message-received", handler);
    };
  }, [meeting, participantId]);

  // Webcam
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      const ms = new MediaStream();
      ms.addTrack(webcamStream.track);
      videoRef.current.srcObject = ms;
      videoRef.current.play().catch(() => {});
    }
  }, [webcamStream]);

  // Mic
  useEffect(() => {
    if (micStream && audioRef.current) {
      const ms = new MediaStream();
      ms.addTrack(micStream.track);
      audioRef.current.srcObject = ms;
      audioRef.current.play().catch(() => {});
    }
  }, [micStream]);

const sendTranslatedCaption = async (text) => {
  await meeting.send({
    type: "caption",
    text: text
  });
};

const startLiveTranslation = () => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;

  recognition.onresult = async (event) => {
    const speech = event.results[event.results.length - 1][0].transcript;

    // Translate API
    const hindi = await translateToHindi(speech);

    // Send to meeting
    sendTranslatedCaption(hindi);
  };

  recognition.start();
};

async function translateToHindi(text) {
  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(
      text
    )}`
  );

  const data = await res.json();

  return data[0][0][0]; // Hindi output
}






  // Screen Share
  useEffect(() => {
    if (screenShareStream && screenRef.current) {
      const ms = new MediaStream();
      ms.addTrack(screenShareStream.track);
      screenRef.current.srcObject = ms;
      screenRef.current.play().catch(() => {});
    }
  }, [screenShareStream]);

  const isActive = activeSpeakerId === participantId;

  return (
    <div className="bg-black p-2 rounded-md relative border border-gray-700">
      {/* SCREEN SHARE */}
      {screenShareStream ? (
        <video ref={screenRef} autoPlay playsInline className="w-full h-48" />
      ) : webcamOn ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-48" />
      ) : (
        <div className="h-48 flex justify-center items-center text-white text-3xl">
          {displayName?.charAt(0)}
        </div>
      )}

      <audio ref={audioRef} autoPlay playsInline />

      {/* USER NAME */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
        {displayName} {isLocal ? "(You)" : ""}
      </div>

      {/* ACTIVE SPEAKER */}
      {isActive && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs">
          Speaking
        </div>
      )}
           <button
  onClick={startLiveTranslation}
  className="px-3 py-2 bg-purple-600 text-white rounded"
>
  Start Translation 🔄
</button>

      {/* TRANSLATED CAPTIONS */}
      {caption && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded text-sm max-w-[90%] text-center"
        >
          {caption}
        </div>
      )}
    </div>
  );
}
