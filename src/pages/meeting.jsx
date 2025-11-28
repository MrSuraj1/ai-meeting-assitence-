import React, { useState } from "react";
import MeetingUI from "../component/MeetingView";

export default function MeetingPage1() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {!joined ? (
        <div className="bg-white p-6 rounded-xl shadow-md w-80">
          <h2 className="text-xl font-semibold text-center mb-4">
            Enter Your Name
          </h2>

          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={() => {
              if (!name.trim()) return;
              setJoined(true);
            }}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Join Meeting
          </button>
        </div>
      ) : (
        <MeetingUI userName={name} />
      )}
    </div>
  );
}
