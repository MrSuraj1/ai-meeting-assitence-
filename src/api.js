import axios from "axios";

const API = axios.create({
  baseURL: "https://your-backend-service.onrender.com/api",
  withCredentials: true,  
});

export default API;
