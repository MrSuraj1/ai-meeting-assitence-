import axios from "axios";

export const getToken = async () => {
  const API_KEY = "df83590d-a877-4446-a58b-d7a23534c299"; // put your real key here

  const res = await axios.post(
    "https://api.videosdk.live/v2/token",
    { apikey: API_KEY, permissions: ["allow_join", "allow_mod"] },
    { headers: { "Content-Type": "application/json" } }
  );

  return res.data.token;
};
