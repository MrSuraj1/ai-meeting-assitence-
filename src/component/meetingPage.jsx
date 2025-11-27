// src/MeetingPage.jsx
import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MeetingView from "./MeetingView";

export default function MeetingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // query params se token nikalo
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  console.log("📦 MeetingPage loaded", { meetingId: id, token });

  useEffect(() => {
    if (!token) {
      console.error("❌ ERROR: Token missing in MeetingPage");
      alert("Token missing — returning to home");
      navigate("/");
    }
  }, [token]);

  return (
    <div className="p-4">
      <MeetingView meetingId={id} token={token} />
    </div>
  );
}