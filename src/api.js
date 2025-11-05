import axios from "axios";

// Use your Render backend URL
const API = axios.create({
  baseURL: "https://ai-backend-zczd.onrender.com/api",
  withCredentials: true,  // optional, if backend supports cookies/sessions
});

export default API;
