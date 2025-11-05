import React from "react";
import { useParams } from "react-router-dom";
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import { MeetingView } from "./MeetingView";

function JoinMeeting() {
  const { meetingId } = useParams();
  const token = import.meta.env.VITE_VIDEOSDK_TOKEN; // if using Vite

  return (
    <MeetingProvider
      config={{
        meetingId,
        name: "Guest User",
        micEnabled: true,
        webcamEnabled: true,
      }}
      token={token}
    >
      <MeetingConsumer>
        {() => <MeetingView meetingId={meetingId} />}
      </MeetingConsumer>
    </MeetingProvider>
  );
}

export default JoinMeeting;
