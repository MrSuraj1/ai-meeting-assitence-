import { useParams, useLocation } from "react-router-dom";

function MeetingPage() {
  const { meetingId } = useParams();
  const location = useLocation();

  // token proper read karo
  const token = new URLSearchParams(location.search).get("token");

  console.log("📦 MeetingPage loaded", { meetingId, token });

  return (
    <MeetingView meetingId={meetingId} token={token} />
  );
}

export default MeetingPage;
