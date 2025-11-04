import React, { useEffect } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";

const ParticipantView = ({ participantId }) => {
  const { webcamStream, micStream, isWebcamOn, isMicOn } =
    useParticipant(participantId);

  const videoRef = React.useRef(null);

  useEffect(() => {
    if (isWebcamOn && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
  }, [webcamStream, isWebcamOn]);

  return (
    <div>
      <video ref={videoRef} width="300" height="200" autoPlay playsInline />
    </div>
  );
};

export const MeetingView = ({ meetingId }) => {
  const { join, participants } = useMeeting();

  useEffect(() => {
    join();
  }, []);

  return (
    <div className="flex flex-wrap">
      {[...participants.keys()].map((id) => (
        <ParticipantView key={id} participantId={id} />
      ))}
    </div>
  );
};
