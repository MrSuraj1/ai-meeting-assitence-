// src/component/MeetingPage.jsx
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingUI from "./MeetingView";
import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function MeetingPage() {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const token = query.get("token") || sessionStorage.getItem("token");

  React.useEffect(() => {
    if (!token) {
      alert("Token missing. Redirecting home.");
      navigate("/");
    } else {
      // save token for refresh
      sessionStorage.setItem("token", token);
    }
  }, [token]);

  if (!meetingId || !token) {
    return <div className="p-6 text-red-600">Invalid meeting link.</div>;
  }

  return (
    <MeetingProvider
      token={token}
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: false,
        name: "Suraj", // you can replace with actual user name
      }}
    >
      <div className="min-h-screen bg-gray-100">
        <MeetingUI meetingId={meetingId} token={token} />
      </div>
    </MeetingProvider>
  );
}
