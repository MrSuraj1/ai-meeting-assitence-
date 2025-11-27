import { useEffect, useState } from "react";
import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";

export default function MeetingView({ meetingId, token }) {
  console.log("🎬 MeetingView mounted", { meetingId, token });

  return (
    <MeetingProvider
      config={{
        meetingId,
        name: "Suraj",
        micEnabled: true,
        webcamEnabled: true,
      }}
      token={token}
    >
      <MeetingContainer meetingId={meetingId} token={token} />
    </MeetingProvider>
  );
}

function MeetingContainer({ meetingId, token }) {
  const { join, participants } = useMeeting();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    console.log("🚀 useEffect started");
    console.log("🔑 Token:", token);
    console.log("🆔 MeetingId:", meetingId);

    console.log("📡 Sending init-config request...");

    fetch("https://api.videosdk.live/infra/v1/meetings/init-config", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ meetingId }),
    })
      .then((res) => {
        console.log("📥 init-config response status:", res.status);
        return res.json();
      })
      .then((json) => {
        console.log("⚙️ init-config response JSON:", json);
      })
      .catch((err) => console.log("❌ init-config error:", err));

    console.log("📞 Joining meeting now...");
    join();
    setJoined(true);
    console.log("✅ JOINED SUCCESSFULLY");

  }, []);

  console.log("👥 Current Participants:", [...participants.keys()]);

  return (
    <div>
      <h1>Meeting ID: {meetingId}</h1>
      <h2>Status: {joined ? "Joined" : "Joining..."}</h2>

      <div style={{ marginTop: "20px" }}>
        <h3>Participants:</h3>
        {[...participants.keys()].map((p) => (
          <div key={p}>{p}</div>
        ))}
      </div>
    </div>
  );
}
