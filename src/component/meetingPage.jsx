// src/component/meetingPage.jsx
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useParams, useSearchParams } from "react-router-dom";
import { MeetingView } from "./MeetingView";

export default function MeetingPage() {
  const { meetingId } = useParams();
  const [params] = useSearchParams();
  const rawToken = params.get("token");
  const token = rawToken ? decodeURIComponent(rawToken) : null;

  console.log("📦 MeetingPage loaded", {
    meetingId,
    token: token ? token.substring(0, 20) + "..." : "NO_TOKEN",
  });

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: false,
        name: "User",
      }}
      token={token}
    >
      <div className="p-6">
        <h2 className="mb-4">Meeting: <code>{meetingId}</code></h2>
        <MeetingView />
      </div>
    </MeetingProvider>
  );
}
