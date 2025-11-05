import React, { useEffect } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

const ParticipantView = ({ participantId }) => {
  const { webcamStream, isWebcamOn } = useParticipant(participantId);
  const videoRef = React.useRef(null);

useEffect(() => {
  if (webcamOn && webcamStream && videoRef.current) {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(webcamStream.track);
    videoRef.current.srcObject = mediaStream;
  }
}, [webcamStream, webcamOn]);

  return (
    <div className="p-3">
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
};

export const MeetingView = () => {
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
};
