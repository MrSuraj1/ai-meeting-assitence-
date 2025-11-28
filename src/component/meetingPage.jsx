import { useParams } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingView from "./MeetingView";

export default function MeetingPage() {
  console.log("📥 MeetingPage Loaded...");

  const { meetingId } = useParams();

  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  const token = tokenFromUrl || sessionStorage.getItem("token");

  console.log("📦 MeetingPage Data:", {
    meetingId,
    tokenFromUrl,
    token,
  });

  if (!meetingId) {
    return <h2 style={{ color: "red" }}>❌ Invalid Meeting ID</h2>;
  }

  if (!token) {
    return <h2 style={{ color: "red" }}>❌ Token missing</h2>;
  }

  sessionStorage.setItem("token", token);

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Suraj",
      }}
      token={token}
    >
      <MeetingView meetingId={meetingId} token={token} />
    </MeetingProvider>
  );
}
