import { useParams, useSearchParams } from "react-router-dom";
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import ParticipantView from "../components/ParticipantView";

export default function MeetingPage() {
  const { meetingId } = useParams();
  const [params] = useSearchParams();
  const name = params.get("name");

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: name || "Guest",
      }}
      token={"df83590d-a877-4446-a58b-d7a23534c299"}
    >
      <MeetingConsumer>
        {({ participants }) => (
          <div className="flex flex-wrap">
            {[...participants.keys()].map((id) => (
              <ParticipantView key={id} participantId={id} />
            ))}
          </div>
        )}
      </MeetingConsumer>
    </MeetingProvider>
  );
}
