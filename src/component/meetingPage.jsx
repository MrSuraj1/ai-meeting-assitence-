import { useEffect } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { useParams, useSearchParams } from "react-router-dom";

function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const videoRef = useEffect(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      const video = document.getElementById(`video-${participantId}`);
      if (video) video.srcObject = mediaStream;
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="p-4">
      <video
        id={`video-${participantId}`}
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
    join();
  }, []);

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
      <h1 className="text-2xl text-center mt-4">Meeting ID: {meetingId}</h1>
      <MeetingView />
    </MeetingProvider>
  );
}
