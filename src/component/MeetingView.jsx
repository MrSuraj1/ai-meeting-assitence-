import { useMeeting } from "@videosdk.live/react-sdk";

export default function MeetingView() {
  const meeting = useMeeting();

  console.log("🧩 useMeeting returned:", meeting);

  if (!meeting) return <h2>⚠️ Meeting loading...</h2>;

  const { join } = meeting;

  return (
    <div>
      <button
        onClick={() => {
          console.log("🚀 Joining meeting...");
          join();
        }}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Join Meeting
      </button>
    </div>
  );
}
