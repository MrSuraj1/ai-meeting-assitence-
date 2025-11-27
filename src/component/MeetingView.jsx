import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";

function MeetingView({ meetingId, token }) {
  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "User",
      }}
      token={token}   // <-- ZINDAGI KA SABSE IMPORTANT LINE
    >
      <MeetingContainer />
    </MeetingProvider>
  );
}

function MeetingContainer() {
  const { join } = useMeeting();

  useEffect(() => {
    join();
  }, []);

  return <div>JOINED SUCCESSFULLY</div>;
}

export default MeetingView;
