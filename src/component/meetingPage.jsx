// 📁 src/pages/MeetingPage.jsx
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useParams, useSearchParams } from "react-router-dom";
import { MeetingView } from "./MeetingView";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-5xl">
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </h2>
          <MeetingView />
        </div>
      </div>
    </MeetingProvider>
  );
}
