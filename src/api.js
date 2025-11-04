import axios from "axios";

// Use your Render backend URL
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,  // optional, if backend supports cookies/sessions
});

export default API;
