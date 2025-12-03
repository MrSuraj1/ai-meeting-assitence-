import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingView from "./MeetingView";
import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function MeetingPage() {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const token = query.get("token") || sessionStorage.getItem("token");
  const username =
    query.get("name") ||
    localStorage.getItem("username") ||
    "Guest-" + Math.floor(Math.random() * 9999);

  React.useEffect(() => {
    if (!token) {
      alert("Token missing. Redirecting home.");
      navigate("/");
    } else {
      sessionStorage.setItem("token", token);
      localStorage.setItem("username", username);
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
        name: username, // ✔ Dynamic username
      }}
    >
      <div className="min-h-screen bg-gray-100">
        <MeetingView meetingId={meetingId} username={username} token={token} />
      </div>
    </MeetingProvider>
  );
}
