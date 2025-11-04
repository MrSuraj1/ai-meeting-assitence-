import React from "react";
import { useParams } from "react-router-dom";
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import { MeetingView } from "./MeetingView";

function JoinMeeting() {
  const { meetingId } = useParams();

  return (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        name: "Guest User",
        micEnabled: true,
        webcamEnabled: true,
      }}
      token={process.env.REACT_APP_VIDEOSDK_TOKEN}
    >
      <MeetingConsumer>{() => <MeetingView meetingId={meetingId} />}</MeetingConsumer>
    </MeetingProvider>
  );
}

export default JoinMeeting;
