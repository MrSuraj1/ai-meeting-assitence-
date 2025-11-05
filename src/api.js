import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-backend-zczd.onrender.com/api",
  withCredentials: true, // ✅ Add this line
});

export default API;
