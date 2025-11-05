import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-backend-zczd.onrender.com/api",

});

export default API;


  // withCredentials: true, // ✅ Add this line