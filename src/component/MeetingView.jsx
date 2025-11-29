// src/component/MeetingUI.jsx  
import React, { useEffect, useRef, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiVideo, FiMonitor, FiSend } from "react-icons/fi";

console.log("📌 MeetingUI component loaded");

function ParticipantTile({ participantId, spotlightMode, activeSpeakerId }) {
  console.log("👤 Rendering ParticipantTile for:", participantId);

  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    screenShareStream
  } = useParticipant(participantId);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const screenRef = useRef(null);

  // Webcam
  useEffect(() => {
    console.log("🎥 Webcam changed for", participantId, webcamStream);

    if (webcamStream && videoRef.current) {
      const ms = new MediaStream();
      ms.addTrack(webcamStream.track);
      videoRef.current.srcObject = ms;
      videoRef.current.play().catch((e) => console.warn("Video play error", e));
    }
  }, [webcamStream]);

  // Mic
  useEffect(() => {
    console.log("🎤 Mic stream changed for", participantId, micStream);

    if (micStream && audioRef.current) {
      const ms = new MediaStream();
      ms.addTrack(micStream.track);
      audioRef.current.srcObject = ms;
      audioRef.current.play().catch(() => {});
    }
  }, [micStream]);

  // Screen Share
  useEffect(() => {
    console.log("🖥 Screen share changed for", participantId, screenShareStream);

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

      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
        {displayName} {isLocal ? "(You)" : ""}
      </div>

      {isActive && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs">
          Speaking
        </div>
      )}
    </div>
  );
}

export default function MeetingUI({ meetingId, token }) {
  console.log("📌 MeetingUI Props:", { meetingId, token });

  const meeting = useMeeting({
    onMeetingJoined: () => console.log("✅ Meeting joined"),
    onMeetingLeft: () => console.log("❌ Meeting left"),
    onParticipantJoined: (p) => console.log("🟢 Participant joined", p),
    onParticipantLeft: (p) => console.log("🔴 Participant left", p),
    onSpeakerChanged: (activeSpeakerId) =>
      console.log("🔊 Active speaker changed:", activeSpeakerId),
    onMessageReceived: (msg) => console.log("💬 Message received:", msg)
  });

  const [joined, setJoined] = useState(false);
  const [layout, setLayout] = useState("grid");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [raiseHandSet, setRaiseHandSet] = useState(new Set());

  // Sync SDK messages → UI
  useEffect(() => {
    console.log("📨 Messages updated:", meeting?.messages);
    setMessages([...(meeting?.messages || [])]);
  }, [meeting?.messages]);

  const participants = [...(meeting?.participants?.keys() || [])];
  const activeSpeakerId = meeting?.activeSpeakerId;

  // JOIN
  const joinMeeting = async () => {
    console.log("🔵 Joining meeting...");
    await meeting.join();
    setJoined(true);
  };

  // LEAVE
  const leaveMeeting = async () => {
    console.log("🔴 Leaving meeting...");
    await meeting.leave();
    setJoined(false);
  };

  // Mic
  const toggleMic = () => {
    console.log("🎤 Toggling mic");
    meeting.toggleMic();
  };

  // Cam
  const toggleWebcam = () => {
    console.log("🎥 Toggling webcam");
    meeting.toggleWebcam();
  };

  // Screen Share
  const toggleScreenShare = () => {
    console.log("🖥 Toggling screen share");
    meeting.toggleScreenShare();
  };

  // Chat
  const sendMessage = async () => {
    if (!message.trim()) return;

    console.log("💬 Sending message:", message);

    await meeting.send({
      type: "chat",
      text: message
    });

    setMessage("");
  };

  // Raise Hand
  const toggleRaiseHand = () => {
    const id = meeting.localParticipant.id;
    console.log("✋ Raise hand clicked by", id);

    const newSet = new Set(raiseHandSet);

    if (newSet.has(id)) {
      newSet.delete(id);
      meeting.send({ type: "raise-hand", action: "lower", from: id });
    } else {
      newSet.add(id);
      meeting.send({ type: "raise-hand", action: "raise", from: id });
    }

    setRaiseHandSet(newSet);
  };

  return (
  <div className="flex flex-col lg:flex-row h-screen">
    {/* LEFT */}
    <div className="flex-1 p-4 overflow-auto">

      <h2 className="text-xl font-semibold">
        Meeting: <span className="text-blue-600">{meetingId}</span>
      </h2>

      <div className="flex flex-wrap gap-2 mb-3">
        {!joined ? (
          <button onClick={joinMeeting} className="px-3 py-2 bg-green-600 text-white rounded">
            Join
          </button>
        ) : (
          <button onClick={leaveMeeting} className="px-3 py-2 bg-red-600 text-white rounded">
            Leave
          </button>
        )}

        <button onClick={toggleMic} className="p-2 bg-gray-200 rounded">
          <FiMic />
        </button>

        <button onClick={toggleWebcam} className="p-2 bg-gray-200 rounded">
          <FiVideo />
        </button>

        <button onClick={toggleScreenShare} className="p-2 bg-gray-200 rounded">
          <FiMonitor />
        </button>

        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="grid">Grid</option>
          <option value="spotlight">Spotlight</option>
        </select>
      </div>

      {/* VIDEO GRID */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          xl:grid-cols-4
          gap-4
        "
      >
        {participants.map((pId) => (
          <ParticipantTile
            key={pId}
            participantId={pId}
            spotlightMode={layout === "spotlight"}
            activeSpeakerId={activeSpeakerId}
          />
        ))}
      </div>
    </div>

    {/* RIGHT (CHAT) */}
    <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l p-4 h-56">
      <h3 className="font-semibold">Chat</h3>

      <button
        onClick={toggleRaiseHand}
        className="px-3 py-1 bg-yellow-300 rounded mt-2"
      >
        Raise Hand ✋
      </button>

      <div className="h-80 overflow-auto bg-gray-50 p-2 mt-4 rounded">
        {messages.map((m, idx) => (
          <div key={idx} className="p-2 bg-white mb-2 rounded shadow-sm">
            <b>{m.senderId || m.from}</b>: {m.text}
          </div>
        ))}
      </div>

      <input
        className="border p-2 rounded w-full mt-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Write a message..."
      />

      <button
        onClick={sendMessage}
        className="mt-2 w-full bg-blue-600 text-white p-2 rounded"
      >
        <FiSend />
      </button>
    </div>
  </div>
);

}
