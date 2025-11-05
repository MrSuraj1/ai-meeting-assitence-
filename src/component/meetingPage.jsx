import React, { useEffect, useRef } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { useParams, useSearchParams } from "react-router-dom";

function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("🎥 useEffect for:", participantId);
    console.log("   webcamOn:", webcamOn, "| webcamStream:", webcamStream);

    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      console.log("✅ Stream attached for:", participantId);
    } else {
      console.log("⚠️ Stream not ready for:", participantId);
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg w-64 h-48 border"
      />
      <p className="text-center text-sm mt-1">{participantId}</p>
    </div>
  );
}

function MeetingView() {
  const { join, participants } = useMeeting();

  useEffect(() => {
    console.log("🚀 Joining meeting...");
    join();
  }, []);

  useEffect(() => {
    console.log("👥 Participants:", [...participants.keys()]);
  }, [participants]);

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {[...participants.keys()].map((id) => (
        <ParticipantView key={id} participantId={id} />
      ))}
    </div>
  );
}

export default function MeetingPage() {
  const { meetingId } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token");

  console.log("📦 MeetingPage loaded");
  console.log("🆔 meetingId:", meetingId);
  console.log("🎟️ token:", token);

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "User",
      }}
      token={token}
    >
      <MeetingView />
    </MeetingProvider>
  );
}
